import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useContext } from "react";
import { router } from "expo-router";
import Avatar from "@/components/Avatar";
import LastWeekActivity from "@/components/LastWeekActivity";
import WelcomeMessage from "@/components/WelcomeMessage";
import CustomSafeArea from "@/components/CustomSafeArea";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AuthContext } from "@/context/authContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const quickStats = [
  { title: "Rides", value: "12" },
  { title: "Minutes", value: "245" },
  { title: "Calories", value: "1840" },
];

const secondaryTiles = [
  {
    title: "Leaderboard",
    subtitle: "See who leads this week",
    link: "/leaderboard",
    wide: true,
    icon: <MaterialIcons name="leaderboard" size={32} color="#EB7363" />,
  },
  {
    title: "Groups",
    subtitle: "Join ride groups",
    link: "/groups",
    icon: <MaterialIcons name="groups" size={32} color="#EB7363" />,
  },
  {
    title: "Schedule",
    subtitle: "Plan your training",
    link: "/workoutSchedule",
    icon: <AntDesign name="calendar" size={32} color="#EB7363" />,
  },
  {
    title: "Friends",
    subtitle: "See your riders",
    link: "/friendslist",
    icon: <MaterialIcons name="group" size={32} color="#EB7363" />,
  },
  {
    title: "Current Workout",
    subtitle: "Continue your session",
    link: "/currentWorkout",
    icon: <FontAwesome5 name="running" size={32} color="#22C55E" />,
  },
];

const StatCard = ({ item }) => {
  return (
    <View className="flex-1 bg-[#15171C] rounded-2xl px-4 py-4">
      <Text className="text-gray-400 text-xs">{item.title}</Text>
      <Text className="text-white text-xl font-bold mt-1">{item.value}</Text>
    </View>
  );
};

const FeaturedCard = ({ title, subtitle, link, icon }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(link)}
      className="flex-1 bg-[#15171C] rounded-2xl p-4 min-h-[180px] justify-between"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text className="text-white text-lg font-semibold">{title}</Text>
          <Text className="text-gray-400 text-sm mt-1">{subtitle}</Text>
        </View>
        {icon}
      </View>

      <View className="items-end">
        <MaterialIcons name="keyboard-arrow-right" size={24} color="#EB7363" />
      </View>
    </TouchableOpacity>
  );
};

const SmallTile = ({ item }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(item.link)}
      className={`${item.wide ? "w-full min-h-[150px]" : "w-[48.5%] min-h-[140px]"} bg-[#15171C] rounded-2xl p-4 justify-between`}
    >
      <View>{item.icon}</View>

      <View>
        <Text className="text-white font-semibold text-base">{item.title}</Text>
        <Text className="text-gray-400 text-xs mt-1">{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const username = user?.username ? user.username : "Username";

  return (
    <CustomSafeArea applyTopInset={false} bgColour="black">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center my-4">
          <View>
            <WelcomeMessage name={username} />
            <Text className="text-gray-400 mt-1">
              Ready for your next ride?
            </Text>
          </View>
          <Avatar size={50} />
        </View>

        <View className="mb-5">
          <Text className="text-white text-lg font-semibold mb-3">Overview</Text>
          <View className="flex-row gap-3">
            {quickStats.map((item) => (
              <StatCard key={item.title} item={item} />
            ))}
          </View>
        </View>

        <View className="mb-5">
          <LastWeekActivity />
        </View>

        <View className="mb-3">
          <Text className="text-white text-lg font-semibold">Main Actions</Text>
          <Text className="text-gray-400 text-sm mt-1">
            Start quickly with the most used features
          </Text>
        </View>

        <View className="flex-row gap-4 mb-5">
          <FeaturedCard
            title="Connect"
            subtitle="Ride with others and stay social"
            link="/connect"
            icon={<MaterialIcons name="people-alt" size={36} color="#EB7363" />}
          />
          <FeaturedCard
            title="Start workout"
            subtitle="Begin a new cycling session"
            link="/startworkout"
            icon={
              <MaterialCommunityIcons name="bike" size={36} color="#EB7363" />
            }
          />
        </View>

        <View className="mb-3">
          <Text className="text-white text-lg font-semibold">More Features</Text>
          <Text className="text-gray-400 text-sm mt-1">
            Access the rest of your training tools
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-4">
          {secondaryTiles.map((item) => (
            <SmallTile key={item.title} item={item} />
          ))}
        </View>
      </ScrollView>
    </CustomSafeArea>
  );
};

export default Home;
