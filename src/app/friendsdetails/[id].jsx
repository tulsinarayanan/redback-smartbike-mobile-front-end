import React, { useContext, useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

import CustomSafeArea from "@/components/CustomSafeArea";
import FriendAvatar from "@/features/friends/components/FriendAvatar";
import FriendWeeklyBars from "@/features/friends/components/FriendWeeklyBars";
import { AuthContext } from "@/context/authContext";
import {
  fetchFriends,
  friends,
  formatActivityDate,
  getFriendById,
  getWeeklyMinutes,
} from "@/features/friends/data";

export default function FriendDetails() {
  const { id } = useLocalSearchParams();
  const { user } = useContext(AuthContext);
  const [friendsList, setFriendsList] = useState(friends);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const friend = getFriendById(id, friendsList);

  useEffect(() => {
    let isMounted = true;

    setIsLoadingFriends(true);

    fetchFriends(user?.id)
      .then((apiFriends) => {
        if (isMounted && apiFriends.length > 0) {
          setFriendsList(apiFriends);
        }
      })
      .catch((error) => {
        console.warn("Friends API unavailable. Using mock data.", error);
        if (isMounted) {
          setFriendsList(friends);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingFriends(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  if (!friend && isLoadingFriends) {
    return (
      <CustomSafeArea bgColour="#050505">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-semibold text-center text-white">
            Loading friend...
          </Text>
        </View>
      </CustomSafeArea>
    );
  }

  if (!friend) {
    return (
      <CustomSafeArea bgColour="#050505">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-semibold text-center text-white">
            Friend not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 rounded-full bg-[#18181b] px-5 py-3"
          >
            <Text className="text-white font-semibold">Go back</Text>
          </TouchableOpacity>
        </View>
      </CustomSafeArea>
    );
  }

  const statCards = [
    { label: "Distance", value: friend.latestWorkout.distance },
    { label: "Duration", value: friend.latestWorkout.duration },
    { label: "Calories", value: friend.latestWorkout.calories },
    { label: "Avg speed", value: friend.latestWorkout.averageSpeed },
  ];

  return (
    <CustomSafeArea bgColour="#050505">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4"
        >
          <AntDesign name="arrowleft" size={20} color="white" />
        </TouchableOpacity>

        {/* Profile */}
        <Image
          source={{ uri: friend.photo }}
          className="w-40 h-40 rounded-full self-center mb-4"
        />

        <Text className="text-white text-2xl font-bold text-center">
          {friend.name}
        </Text>

        <Text className="text-gray-400 text-center mt-1">
          {friend.email}
        </Text>

        {/* Message Button */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/chat/[id]",
              params: {
                id: friend.id,
                mode: "profile",
                name: friend.name,
                photo: friend.photo,
                status: friend.status || "Active",
              },
            })
          }
          className="bg-purple-600 mt-4 rounded-xl py-3 mx-10"
        >
          <Text className="text-white text-center font-semibold">
            Message
          </Text>
        </TouchableOpacity>

        {/* Workout Highlight */}
        <View className="mt-6 bg-[#15151a] p-4 rounded-xl">
          <Text className="text-white text-lg font-semibold">
            {friend.latestWorkout.title}
          </Text>
          <Text className="text-gray-400 mt-2">
            {friend.latestWorkout.type} -{" "}
            {formatActivityDate(friend.latestWorkout.date)}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row flex-wrap mt-5 gap-3">
          {statCards.map((stat) => (
            <View
              key={stat.label}
              className="bg-[#15151a] p-4 rounded-xl"
              style={{ width: "47%" }}
            >
              <Text className="text-gray-400 text-xs">
                {stat.label}
              </Text>
              <Text className="text-white text-lg font-bold mt-1">
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Weekly Activity */}
        <View className="mt-6 bg-[#15151a] p-4 rounded-xl">
          <Text className="text-white text-lg font-bold">
            Weekly Activity
          </Text>
          <Text className="text-gray-400 mt-1">
            {getWeeklyMinutes(friend)} minutes this week
          </Text>

          <FriendWeeklyBars
            weeklyActivity={friend.weeklyActivity}
            accent={friend.accent}
          />
        </View>
      </ScrollView>
    </CustomSafeArea>
  );
}
