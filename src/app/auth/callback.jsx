import { ActivityIndicator, View } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "@/context/authContext";

const AuthCallback = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace("/(tabs)/home");
      return;
    }

    const timeout = setTimeout(() => {
      router.replace("/");
    }, 1500);

    return () => clearTimeout(timeout);
  }, [user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#340C4C" />
    </View>
  );
};

export default AuthCallback;
