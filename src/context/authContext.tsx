import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";

type OAuthProvider = "apple" | "facebook" | "google";

type FormattedUser = {
  id: string;
  username: string;
  email: string;
  rawUser: User;
} | null;

type AuthContextType = {
  session: Session | null;
  user: FormattedUser;
  loading: boolean;
  supabase: typeof supabase;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, username?: string) => Promise<any>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  setUser: React.Dispatch<React.SetStateAction<FormattedUser>>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const formatUser = (supabaseUser: User | null | undefined): FormattedUser => {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    username:
      supabaseUser.user_metadata?.username ||
      supabaseUser.email?.split("@")[0] ||
      "User",
    email: supabaseUser.email || "",
    rawUser: supabaseUser,
  };
};

export const ensureUserProfile = async (
  supabaseUser: User | null | undefined,
  username = "",
) => {
  if (!supabaseUser?.id) {
    return { data: null, error: null };
  }

  const email = supabaseUser.email || "";
  const fallbackName =
    username.trim() ||
    supabaseUser.user_metadata?.username ||
    supabaseUser.user_metadata?.name ||
    supabaseUser.user_metadata?.full_name ||
    email.split("@")[0] ||
    "User";

  const profile = {
    id: supabaseUser.id,
    email,
    username: fallbackName,
    name: fallbackName,
    avatar_url: supabaseUser.user_metadata?.avatar_url ?? null,
  };

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", supabaseUser.id)
    .maybeSingle();

  if (selectError) {
    console.error("Profile lookup failed:", selectError.message);
  }

  if (existingProfile) {
    return { data: existingProfile, error: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("Profile upsert failed:", error.message);
  }

  return { data, error };
};

const repairUserProfile = (
  supabaseUser: User | null | undefined,
  username = "",
) => {
  ensureUserProfile(supabaseUser, username).catch((error) => {
    console.error("Profile repair failed:", error);
  });
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 5000) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Auth session restore timed out"));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
};

const getOAuthCallbackParams = (url: string) => {
  const paramsString = url.includes("#")
    ? url.split("#")[1]
    : url.split("?")[1];

  if (!paramsString) return null;

  const params = new URLSearchParams(paramsString);

  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
    error: params.get("error"),
    errorDescription: params.get("error_description"),
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<FormattedUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const handleOAuthCallback = async (url: string | null) => {
      if (!url) return;

      const params = getOAuthCallbackParams(url);

      if (!params) return;

      if (params.error) {
        console.error(
          "OAuth error:",
          params.errorDescription || params.error,
        );
        return;
      }

      if (!params.accessToken || !params.refreshToken) return;

      const { data, error } = await supabase.auth.setSession({
        access_token: params.accessToken,
        refresh_token: params.refreshToken,
      });

      if (error) {
        console.error("OAuth session error:", error.message);
        return;
      }

      if (mounted) {
        repairUserProfile(data.session?.user);
        setSession(data.session ?? null);
        setUser(formatUser(data.session?.user));
      }
    };

    const getInitialSession = async () => {
      try {
        const { data, error } = await withTimeout(supabase.auth.getSession());

        if (error) {
          console.warn("Get session error:", error.message);
        }

        if (mounted) {
          const currentSession = data?.session ?? null;
          repairUserProfile(currentSession?.user);
          setSession(currentSession);
          setUser(formatUser(currentSession?.user));
        }
      } catch (error) {
        console.error("Get session error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();
    Linking.getInitialURL().then(handleOAuthCallback);

    const urlSubscription = Linking.addEventListener("url", ({ url }) => {
      handleOAuthCallback(url);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      repairUserProfile(newSession?.user);
      setSession(newSession ?? null);
      setUser(formatUser(newSession?.user));
      setLoading(false);
    });

    return () => {
      mounted = false;
      urlSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      supabase,

      signIn: async (email: string, password: string) => {
        const response = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (response?.data?.session) {
          await ensureUserProfile(response.data.session.user);
          setSession(response.data.session);
          setUser(formatUser(response.data.session.user));
        }

        return response;
      },

      signUp: async (email: string, password: string, username = "") => {
        const response = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });

        if (response?.data?.user) {
          await ensureUserProfile(response.data.user, username);
        }

        if (response?.data?.session) {
          setSession(response.data.session);
          setUser(formatUser(response.data.session.user));
        }

          return response;
        },

        signInWithOAuth: async (provider: OAuthProvider) => {
          const redirectTo = Linking.createURL("auth/callback");

          const response = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo,
              skipBrowserRedirect: true,
            },
          });

          if (response.error || !response.data?.url) {
            return response;
          }

          await Linking.openURL(response.data.url);

          return response;
        },

        signOut: async () => {
          const response = await supabase.auth.signOut();

        if (!response.error) {
          setSession(null);
          setUser(null);
        }

        return response;
      },

      resetPassword: async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email.trim());
      },

      setUser,
    }),
    [session, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
