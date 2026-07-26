import { AuthProvider, useAuth } from "@/context/authContext";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isAuthOnlyScreen =
      pathname === "/" ||
      pathname === "/signup" ||
      pathname === "/forgot-password";

    const isPublicScreen = pathname === "/dashboard";
    const isAuthCallbackScreen = pathname.startsWith("/auth/callback");

    if (!user && !isAuthOnlyScreen && !isPublicScreen && !isAuthCallbackScreen) {
      router.replace("/");
      return;
    }

    if (user && isAuthOnlyScreen) {
      router.replace("/(tabs)/home");
    }
  }, [user, loading, pathname]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#340C4C" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerTitle: "",
        headerTintColor: "black",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />

          <Stack.Screen name="chat/index" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />

          <Stack.Screen
            name="(scheduleWorkout)"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />

      <Stack.Screen
        name="(deleteAccountConfirmation)"
        options={{
          presentation: "transparentModal",
          headerShown: false,
          animation: "fade",
        }}
      />

      <Stack.Screen
        name="(settings)/editProfile"
        options={{
          headerShown: true,
          headerTitle: "Edit Profile",
          headerTintColor: "black",
        }}
      />

      <Stack.Screen
        name="(settings)/deleteAccount"
        options={{
          headerShown: true,
          headerTitle: "Delete Account",
          headerTintColor: "black",
        }}
      />

      <Stack.Screen
        name="(settings)/privacySettings"
        options={{
          headerShown: true,
          headerTitle: "Privacy",
          headerTintColor: "black",
        }}
      />

      <Stack.Screen
        name="(settings)/aboutUs"
        options={{
          headerShown: true,
          headerTitle: "About",
          headerTintColor: "black",
        }}
      />

          <Stack.Screen
            name="currentWorkout"
            options={{
              headerShown: true,
              headerTitle: "",
              headerTintColor: "white",
            }}
          />

          <Stack.Screen
            name="leaderboard"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
  );
};

const _layout = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default _layout;
