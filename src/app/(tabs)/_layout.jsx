import React from "react";
import { Tabs } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarItemStyle: {
          borderTopWidth: 0,
        },

        tabBarStyle: {
          height: 70,
          borderTopWidth: 0,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: "white",
          position: "absolute",
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

      {/* Hidden tab screen so friendslist keeps the bottom navigation bar */}
      <Tabs.Screen
        name="friendslist"
        options={{
          href: null,
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