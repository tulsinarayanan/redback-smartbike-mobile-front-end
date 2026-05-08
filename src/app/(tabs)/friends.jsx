import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import CustomSafeArea from "@/components/CustomSafeArea";

// Mock friend activity data with gradient colors
const initialData = [
  {
    id: "1",
    name: "Mila",
    type: "ride",
    km: 12.4,
    min: 32,
    kcal: 245,
    likes: 3,
    comments: 1,
    colors: ["#ff3b30", "#ff7e67"], // Red to coral
  },
  {
    id: "2",
    name: "Jay",
    type: "goal",
    likes: 6,
    comments: 2,
    colors: ["#4cd964", "#8de37f"], // Green gradient
  },
  {
    id: "3",
    name: "Noah",
    type: "ride",
    km: 5.8,
    min: 14,
    kcal: 114,
    likes: 1,
    comments: 0,
    colors: ["#007aff", "#4f8df7"], // Blue gradient
  },
];

// Returns descriptive text for each activity
const subtitle = (a) =>
  a.type === "ride"
    ? `Rode ${a.km?.toFixed(1)} km • ${a.min} min • ${a.kcal} kcal`
    : "Hit a weekly goal 🎯";

// Single friend activity card with gradient background
function ActivityCard({ a }) {
  return (
    <LinearGradient
      colors={a.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <Text style={{ color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>
        {a.name}
      </Text>

      <Text style={{ color: "white", opacity: 0.9, fontSize: 14, marginTop: 2 }}>
        {subtitle(a)}
      </Text>

      <Text style={{ color: "white", opacity: 0.85, fontSize: 12, marginTop: 12 }}>
        {a.likes} likes • {a.comments} comments
      </Text>
    </LinearGradient>
  );
}

export default function Friends() {
  const [data] = useState(initialData);

  return (
    <CustomSafeArea applyTopInset={false} className="flex-1 bg-white">
      {/* Page header */}
      <View className="flex-row justify-between items-center m-2 mt-8">
        <Text className="text-brand-purple my-6 font-bold text-4xl">
          Friends Activity
        </Text>
        <TouchableOpacity onPress={() => router.push("/chat")}>
          <FontAwesome6 name="comments" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Gradient friend activity list */}
      <FlatList
        data={data}
        keyExtractor={(x) => x.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 24 }}
        renderItem={({ item }) => <ActivityCard a={item} />}
      />
    </CustomSafeArea>
  );
}
