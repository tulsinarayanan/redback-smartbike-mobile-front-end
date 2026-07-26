import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useAuth } from "@/context/authContext";

const Setting = ({ settingTitle, icon, link, isLogOut }) => {
  const { signOut } = useAuth();

  const handlePress = async () => {
    if (isLogOut) {
      try {
        const { error } = await signOut();

        if (error) {
          Alert.alert("Logout failed", error.message);
          return;
        }

        router.replace("/");
      } catch (error) {
        console.error("Logout failed:", error);
        Alert.alert("Logout failed", "Something went wrong while logging out.");
      }
      return;
    }

    router.push(link);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center py-4 px-1"
    >
      <View className="w-8 items-center">{icon}</View>

      <Text className="ml-2 text-base font-medium text-white">
        {settingTitle}
      </Text>

      <MaterialIcons
        className="ml-auto"
        name="navigate-next"
        size={22}
        color="#9ca3af"
      />
    </TouchableOpacity>
  );
};

export default Setting;
