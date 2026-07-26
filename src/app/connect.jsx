import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import CustomSafeArea from "../components/CustomSafeArea";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const connectOptions = [
  {
    title: "Find Friends",
    subtitle: "Search and connect with riders",
    label: "Social",
    icon: <AntDesign name="search1" size={24} color="#FF7A59" />,
    link: "/friendslist",
  },
  {
    title: "Join Group Ride",
    subtitle: "Ride together with your community",
    label: "Community",
    icon: <MaterialIcons name="groups" size={24} color="#FF7A59" />,
    link: "/groups",
  },
  {
    title: "Friend Requests",
    subtitle: "Accept and manage rider requests",
    label: "Requests",
    icon: <AntDesign name="addusergroup" size={24} color="#FF7A59" />,
    link: "/friendslist",
  },
  {
    title: "Active Riders",
    subtitle: "See who is online right now",
    label: "Live",
    icon: <FontAwesome5 name="bicycle" size={22} color="#FF7A59" />,
    link: "/friendslist",
  },
  {
    title: "Messages",
    subtitle: "Stay in touch with friends",
    label: "Chat",
    icon: (
      <MaterialCommunityIcons
        name="message-text-outline"
        size={24}
        color="#FF7A59"
      />
    ),
    link: "/friendslist",
  },
  {
    title: "Invite a Friend",
    subtitle: "Grow your cycling network",
    label: "Invite",
    icon: <AntDesign name="useradd" size={24} color="#FF7A59" />,
    link: "/friendslist",
  },
];

const ConnectCard = ({ item }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(item.link)}
      className="w-[48.5%] bg-[#141A26] rounded-3xl p-4 min-h-[180px] justify-between"
    >
      <View className="flex-row justify-between items-start">
        <View className="bg-[#221A22] rounded-2xl w-12 h-12 items-center justify-center">
          {item.icon}
        </View>

        <View className="bg-[#1D2432] px-3 py-1 rounded-full">
          <Text className="text-[#AAB2C0] text-[10px] font-medium">
            {item.label}
          </Text>
        </View>
      </View>

      <View>
        <Text className="text-white text-lg font-semibold">{item.title}</Text>
        <Text className="text-[#9CA3AF] text-sm mt-1 leading-5">
          {item.subtitle}
        </Text>
      </View>

      <View className="flex-row justify-end">
        <View className="w-8 h-8 rounded-full bg-[#1D2432] items-center justify-center">
          <MaterialIcons
            name="keyboard-arrow-right"
            size={20}
            color="#FF7A59"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function Connect() {
  return (
    <CustomSafeArea bgColour="#0B0F1A">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity className="mb-4 self-start" onPress={() => router.back()}>
          <View className="flex-row items-center">
            <MaterialIcons name="arrow-back" size={18} color="#C2C8D0" />
            <Text className="text-[#C2C8D0] text-base ml-1">Back</Text>
          </View>
        </TouchableOpacity>

        <View className="bg-[#141A26] rounded-[28px] p-5 mb-6 border border-[#1F2937]">
          <View className="w-16 h-16 rounded-full bg-[#221A22] items-center justify-center mb-4">
            <MaterialIcons name="people" size={30} color="#FF7A59" />
          </View>

          <Text className="text-white text-3xl font-bold">Connect</Text>

          <Text className="text-[#AAB2C0] text-sm mt-2 leading-5">
            Meet riders, join group sessions and stay connected with your
            cycling community in one place.
          </Text>

          <View className="flex-row gap-3 mt-5">
            <View className="flex-1 bg-[#1D2432] rounded-2xl p-3">
              <Text className="text-[#9CA3AF] text-xs">Friends</Text>
              <Text className="text-white text-xl font-bold mt-1">24</Text>
            </View>

            <View className="flex-1 bg-[#1D2432] rounded-2xl p-3">
              <Text className="text-[#9CA3AF] text-xs">Active Now</Text>
              <Text className="text-white text-xl font-bold mt-1">6</Text>
            </View>

            <View className="flex-1 bg-[#1D2432] rounded-2xl p-3">
              <Text className="text-[#9CA3AF] text-xs">Groups</Text>
              <Text className="text-white text-xl font-bold mt-1">3</Text>
            </View>
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-white text-lg font-semibold">
            Social Hub
          </Text>
          <Text className="text-[#9CA3AF] text-sm mt-1">
            Choose how you want to interact with other riders
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-4">
          {connectOptions.map((item) => (
            <ConnectCard key={item.title} item={item} />
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          className="mt-6 py-4 rounded-2xl bg-[#141A26] border border-[#1F2937]"
        >
          <Text className="text-white text-center font-medium">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </CustomSafeArea>
  );
}
