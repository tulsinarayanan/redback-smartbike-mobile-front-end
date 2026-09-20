import { View, ActivityIndicator } from "react-native";
import React from "react";
import { Tabs, Redirect } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useAuth } from "@/context/authContext";

const _layout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#EB7363" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "home",
          tabBarIcon: ({ focused }) => (
            <Entypo
              name="home"
              size={24}
              color={focused ? "#EB7363" : "gray"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="statistics"
        options={{
          title: "statistics",
          tabBarIcon: ({ focused }) => (
            <Entypo
              name="bar-graph"
              size={24}
              color={focused ? "#EB7363" : "gray"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          title: "workouts",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="weight-lifter"
              size={24}
              color={focused ? "#EB7363" : "gray"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="healthyBot"
        options={{
          title: "Healthy Bot",
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="robot"
              size={24}
              color={focused ? "#EB7363" : "gray"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="progression"
        options={{
          title: "progression",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="trophy"
              size={20}
              color={focused ? "#EB7363" : "gray"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="friends"
        options={{
          title: "friends",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="users"
              size={24}
              color={focused ? "#EB7363" : "gray"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "settings",
          tabBarIcon: ({ focused }) => (
            <Entypo
              name="cog"
              size={24}
              color={focused ? "#EB7363" : "gray"}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
