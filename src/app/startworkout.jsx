import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import CustomSafeArea from "../components/CustomSafeArea";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

const workoutOptions = [
  {
    title: "Free Ride",
    subtitle: "Start riding without a set target",
    difficulty: "Easy",
    duration: "15-60 min",
    icon: <FontAwesome5 name="bicycle" size={24} color="#FF8A65" />,
    link: "/currentWorkout",
  },
  {
    title: "Goal-based",
    subtitle: "Train towards distance, time or calorie goals",
    difficulty: "Medium",
    duration: "20-45 min",
    icon: <MaterialIcons name="track-changes" size={24} color="#FF8A65" />,
    link: "/currentWorkout",
  },
  {
    title: "Group Ride",
    subtitle: "Join a social session with other riders",
    difficulty: "Medium",
    duration: "30-60 min",
    icon: <MaterialIcons name="groups" size={24} color="#FF8A65" />,
    link: "/currentWorkout",
  },
  {
    title: "Interval Training",
    subtitle: "Alternate between intense and recovery rounds",
    difficulty: "Hard",
    duration: "20-30 min",
    icon: (
      <MaterialCommunityIcons name="chart-line" size={24} color="#FF8A65" />
    ),
    link: "/currentWorkout",
  },
  {
    title: "Scenic Ride",
    subtitle: "Enjoy a calmer ride with a more relaxed pace",
    difficulty: "Easy",
    duration: "20-50 min",
    icon: (
      <MaterialCommunityIcons
        name="image-filter-hdr"
        size={24}
        color="#FF8A65"
      />
    ),
    link: "/currentWorkout",
  },
  {
    title: "Scheduled Workout",
    subtitle: "Continue from your saved or planned session",
    difficulty: "Planned",
    duration: "Varies",
    icon: <AntDesign name="calendar" size={24} color="#FF8A65" />,
    link: "/workoutSchedule",
  },
];

const getBadgeStyle = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return "bg-[#1E2A24] text-[#4ADE80]";
    case "Medium":
      return "bg-[#2B241C] text-[#FBBF24]";
    case "Hard":
      return "bg-[#2A1E22] text-[#F87171]";
    default:
      return "bg-[#1D2432] text-[#AAB2C0]";
  }
};

const WorkoutCard = ({ item }) => {
  const badgeStyle = getBadgeStyle(item.difficulty).split(" ");

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(item.link)}
      className="bg-[#151923] rounded-3xl p-4 mb-4 border border-[#1F2937]"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="w-12 h-12 rounded-2xl bg-[#241C1C] items-center justify-center">
          {item.icon}
        </View>

        <View className={`px-3 py-1 rounded-full ${badgeStyle[0]}`}>
          <Text className={`${badgeStyle[1]} text-[10px] font-semibold`}>
            {item.difficulty}
          </Text>
        </View>
      </View>

      <Text className="text-white text-lg font-semibold">{item.title}</Text>

      <Text className="text-[#9CA3AF] text-sm mt-1 leading-5">
        {item.subtitle}
      </Text>

      <View className="flex-row justify-between items-center mt-4">
        <View className="bg-[#1D2432] px-3 py-2 rounded-full">
          <Text className="text-[#C7CFDA] text-xs">{item.duration}</Text>
        </View>

        <View className="w-8 h-8 rounded-full bg-[#241C1C] items-center justify-center">
          <MaterialIcons
            name="keyboard-arrow-right"
            size={20}
            color="#FF8A65"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function StartWorkout() {
  return (
    <CustomSafeArea bgColour="#0B0F1A">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          className="mb-4 self-start"
          onPress={() => router.back()}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="arrow-back" size={18} color="#C2C8D0" />
            <Text className="text-[#C2C8D0] text-base ml-1">Back</Text>
          </View>
        </TouchableOpacity>

        <View className="bg-[#151923] rounded-[28px] p-5 mb-6 border border-[#1F2937]">
          <View className="w-16 h-16 rounded-full bg-[#241C1C] items-center justify-center mb-4">
            <FontAwesome5 name="biking" size={30} color="#FF8A65" />
          </View>

          <Text className="text-white text-3xl font-bold">
            Start Workout
          </Text>

          <Text className="text-[#AAB2C0] text-sm mt-2 leading-5">
            Pick a workout mode that matches your goal today. Ride casually,
            train with intensity or jump straight into a planned session.
          </Text>

          <View className="flex-row gap-3 mt-5">
            <View className="flex-1 bg-[#1D2432] rounded-2xl p-3">
              <Text className="text-[#9CA3AF] text-xs">Recommended</Text>
              <Text className="text-white text-base font-bold mt-1">
                Goal-based
              </Text>
            </View>

            <View className="flex-1 bg-[#1D2432] rounded-2xl p-3">
              <Text className="text-[#9CA3AF] text-xs">Today</Text>
              <Text className="text-white text-base font-bold mt-1">
                30 min target
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-white text-lg font-semibold">
            Workout Modes
          </Text>
          <Text className="text-[#9CA3AF] text-sm mt-1">
            Choose the training style that fits your session
          </Text>
        </View>

        {workoutOptions.map((item) => (
          <WorkoutCard key={item.title} item={item} />
        ))}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          className="mt-2 py-4 rounded-2xl bg-[#151923] border border-[#1F2937]"
        >
          <Text className="text-white text-center font-medium">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </CustomSafeArea>
  );
}
