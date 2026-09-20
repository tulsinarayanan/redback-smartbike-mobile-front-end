import React, { useContext, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Entypo from "@expo/vector-icons/Entypo";
import CustomSafeArea from "@/components/CustomSafeArea";
import { AuthContext } from "@/context/authContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const ACHIEVEMENTS_CATALOG = [
  { name: "First Ride", description: "Complete your first ride", xp_reward: 50, icon: "🚴" },
  { name: "Streak Starter", description: "Maintain a 3-day ride streak", xp_reward: 100, icon: "🔥" },
  { name: "Century Rider", description: "Ride 100 km total", xp_reward: 150, icon: "🏆" },
  { name: "Early Bird", description: "Complete a ride before 7am", xp_reward: 30, icon: "🌅" },
  { name: "Night Owl", description: "Complete a ride after 9pm", xp_reward: 30, icon: "🌙" },
];

const SummaryCard = ({ title, value, subtitle, icon }) => (
  <View className="flex-1 bg-[#141A26] rounded-2xl p-4 border border-[#1F2937]">
    <View className="w-10 h-10 rounded-2xl bg-[#221A22] items-center justify-center mb-3">
      {icon}
    </View>
    <Text className="text-[#9CA3AF] text-xs">{title}</Text>
    <Text className="text-white text-lg font-bold mt-2" numberOfLines={1}>
      {value}
    </Text>
    <Text className="text-[#7E8795] text-xs mt-1" numberOfLines={1}>
      {subtitle}
    </Text>
  </View>
);

export default function Progression() {
  const { user } = useContext(AuthContext);
  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProgression = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setError("No user found");
      return;
    }
    if (!API_BASE_URL) {
      // fallback to user object when API not configured
      const xp = Number(user?.xp) || 0;
      const level = user?.level ?? Math.floor(xp / 100) + 1;
      setProgression({
        level,
        xp,
        streak_days: Number(user?.streak_days) || 0,
        currentLevelXp: xp % 100,
        xpToNextLevel: 100 - (xp % 100),
        progressPercent: Math.round(((xp % 100) / 100) * 100),
        achievements: [],
      });
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const url = `${API_BASE_URL.replace(/\/$/, "")}/api/progression/${encodeURIComponent(user.id)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setProgression(data);
    } catch (e) {
      clearTimeout(timeout);
      // offline / not yet migrated — derive from user and show fallback, but surface error
      const xp = Number(user?.xp) || 0;
      const level = user?.level ?? Math.floor(xp / 100) + 1;
      const isAbort = e?.name === "AbortError";
      setProgression({
        level,
        xp,
        streak_days: Number(user?.streak_days) || 0,
        currentLevelXp: xp % 100,
        xpToNextLevel: 100 - (xp % 100),
        progressPercent: Math.round(((xp % 100) / 100) * 100),
        achievements: [],
      });
      setError(isAbort ? "Request timed out — backend unreachable (check API URL / backend running)" : "Offline — showing local progress");
      console.warn("Progression fetch failed, using fallback:", e);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [user?.id, user?.xp, user?.level, user?.streak_days]);

  useEffect(() => {
    fetchProgression();
  }, [fetchProgression]);

  // refresh on tab focus — ensures achievements poll in after a ride saves
  useFocusEffect(
    useCallback(() => {
      fetchProgression();
    }, [fetchProgression])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProgression();
    setRefreshing(false);
  }, [fetchProgression]);

  const level = progression?.level ?? 1;
  const xp = Number(progression?.xp) || 0;
  const streakDays = Number(progression?.streak_days) || 0;
  const currentLevelXp = Number(progression?.currentLevelXp ?? xp % 100);
  const xpToNext = Number(progression?.xpToNextLevel ?? 100 - (xp % 100));
  const progressPercent = Number(progression?.progressPercent ?? Math.round((currentLevelXp / 100) * 100));
  const unlockedNames = new Set((progression?.achievements || []).map((a) => a.name));
  const unlockedCount = ACHIEVEMENTS_CATALOG.filter((a) => unlockedNames.has(a.name)).length;

  if (loading) {
    return (
      <CustomSafeArea bgColour="#0B0F1A">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EB7363" />
          <Text className="text-[#9CA3AF] text-sm mt-3">Loading progression...</Text>
        </View>
      </CustomSafeArea>
    );
  }

  return (
    <CustomSafeArea bgColour="#0B0F1A">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EB7363" colors={["#EB7363"]} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={["#171E2A", "#111722"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 28,
            padding: 20,
            borderWidth: 1,
            borderColor: "#1F2937",
            marginBottom: 20,
          }}
        >
          <View className="w-16 h-16 rounded-full bg-[#221A22] items-center justify-center mb-4">
            <FontAwesome5 name="trophy" size={28} color="#EB7363" />
          </View>
          <Text className="text-white text-3xl font-bold">Progression</Text>
          <Text className="text-[#AAB2C0] text-sm mt-2 leading-5">
            Track your level, XP and streak — unlock badges as you ride.
          </Text>
          <View className="mt-5 self-start px-4 py-2 rounded-full bg-[#1D2432]">
            <Text className="text-[#D8DEE8] text-xs font-medium">Player Level {level}</Text>
          </View>
        </LinearGradient>

        {error ? (
          <View className="bg-[#1A2230] border border-[#2A3446] rounded-2xl p-4 mb-5 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-3">
              <MaterialIcons name="cloud-off" size={18} color="#9CA3AF" />
              <Text className="text-[#9CA3AF] text-xs ml-2 flex-1">{error}</Text>
            </View>
            <TouchableOpacity
              onPress={fetchProgression}
              className="bg-[#EB7363] rounded-full px-4 py-2"
              activeOpacity={0.85}
            >
              <Text className="text-white text-xs font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Summary cards — Level / XP / Streak */}
        <View className="flex-row gap-3 mb-6">
          <SummaryCard
            title="Player Level"
            value={`Lv ${level}`}
            subtitle={`${currentLevelXp} / 100 XP`}
            icon={<FontAwesome5 name="star" size={18} color="#EB7363" />}
          />
          <SummaryCard
            title="Total XP"
            value={`${xp.toLocaleString()} XP`}
            subtitle={`${xpToNext} to next level`}
            icon={<MaterialIcons name="bolt" size={20} color="#EB7363" />}
          />
          <SummaryCard
            title="Active Streak"
            value={`🔥 ${streakDays} days`}
            subtitle={streakDays > 0 ? "Keep it going!" : "Start a ride today"}
            icon={<MaterialIcons name="local-fire-department" size={20} color="#EB7363" />}
          />
        </View>

        {/* XP Progress Bar */}
        <LinearGradient
          colors={["#181F2C", "#111722"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: "#1F2937",
            marginBottom: 24,
          }}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 pr-3">
              <Text className="text-white text-lg font-semibold">Level Progress</Text>
              <Text className="text-[#9CA3AF] text-sm mt-1">
                {currentLevelXp} XP earned in this level — {xpToNext} XP to Level {level + 1}
              </Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-[#221A22]">
              <Text className="text-[#EB7363] text-[10px] font-semibold">{progressPercent}%</Text>
            </View>
          </View>

          <View className="h-3 rounded-full bg-[#1D2432] overflow-hidden">
            <View
              className="h-full rounded-full bg-[#EB7363]"
              style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
            />
          </View>

          <View className="flex-row justify-between mt-3">
            <Text className="text-[#7E8795] text-xs">Lv {level}</Text>
            <Text className="text-[#7E8795] text-xs">Lv {level + 1}</Text>
          </View>
          <Text className="text-[#7E8795] text-xs mt-2 text-center">
            {progressPercent}% to Level {level + 1} • {xpToNext} XP needed • Total {xp} XP
          </Text>
        </LinearGradient>

        {/* Achievements Grid */}
        <View className="mb-3 flex-row justify-between items-end">
          <View>
            <Text className="text-white text-lg font-semibold">Achievements</Text>
            <Text className="text-[#9CA3AF] text-sm mt-1">
              {unlockedCount} / {ACHIEVEMENTS_CATALOG.length} unlocked
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-[#1D2432]">
            <Text className="text-[#D8DEE8] text-xs font-medium">{unlockedCount} badges</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-3">
          {ACHIEVEMENTS_CATALOG.map((ach) => {
            const unlocked = unlockedNames.has(ach.name);
            return (
              <View
                key={ach.name}
                className={`w-[48.5%] rounded-2xl p-4 border ${
                  unlocked ? "bg-[#141A26] border-[#1F2937]" : "bg-[#141A26] border-[#1F2937] opacity-60"
                }`}
                style={
                  unlocked
                    ? { borderColor: "#2A3A4F" }
                    : { borderColor: "#1F2937" }
                }
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View
                    className={`w-12 h-12 rounded-2xl items-center justify-center ${
                      unlocked ? "bg-[#221A22]" : "bg-[#1D2432]"
                    }`}
                  >
                    <Text style={{ fontSize: 22, opacity: unlocked ? 1 : 0.5 }}>{ach.icon}</Text>
                  </View>
                  {unlocked ? (
                    <View className="w-7 h-7 rounded-full bg-[#1E2A1E] items-center justify-center border border-[#2A4A2A]">
                      <Entypo name="check" size={14} color="#4ADE80" />
                    </View>
                  ) : (
                    <View className="w-7 h-7 rounded-full bg-[#1D2432] items-center justify-center border border-[#2A3446]">
                      <Entypo name="lock" size={12} color="#7E8795" />
                    </View>
                  )}
                </View>

                <Text
                  className={`text-sm font-semibold ${unlocked ? "text-white" : "text-[#9CA3AF]"}`}
                  numberOfLines={1}
                >
                  {ach.name}
                </Text>
                <Text className="text-[#7E8795] text-xs mt-1 leading-4" numberOfLines={2}>
                  {ach.description}
                </Text>

                <View className="mt-3 flex-row items-center justify-between">
                  <View className={`px-2 py-1 rounded-full ${unlocked ? "bg-[#1E2A1E]" : "bg-[#1D2432]"}`}>
                    <Text className={`text-[10px] font-semibold ${unlocked ? "text-[#4ADE80]" : "text-[#7E8795]"}`}>
                      +{ach.xp_reward} XP
                    </Text>
                  </View>
                  <Text className={`text-[10px] font-medium ${unlocked ? "text-[#4ADE80]" : "text-[#6B7280]"}`}>
                    {unlocked ? "Unlocked" : "Locked"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View className="mt-6 bg-[#141A26] rounded-2xl p-4 border border-[#1F2937]">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-[#221A22] items-center justify-center mr-3">
              <MaterialIcons name="lightbulb" size={18} color="#EB7363" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm font-semibold">Tip</Text>
              <Text className="text-[#9CA3AF] text-xs mt-1 leading-4">
                Complete a ride to earn XP — each 100 XP levels you up. Unlock all 5 badges for bonus rewards.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </CustomSafeArea>
  );
}
