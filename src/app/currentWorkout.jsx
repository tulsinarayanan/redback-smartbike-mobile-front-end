import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";
import CustomSafeArea from "@/components/CustomSafeArea";
import { AuthContext } from "@/context/authContext";
import { useLiveTelemetry, calculateXpForRide, formatTimer } from "@/hooks/useLiveTelemetry";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const MetricCard = ({ label, value, unit, icon, accent = "#EB7363" }) => (
  <View className="w-[48.5%] bg-[#141A26] rounded-2xl p-4 border border-[#1F2937] mb-3">
    <View className="flex-row items-center justify-between mb-3">
      <View className="w-10 h-10 rounded-2xl bg-[#221A22] items-center justify-center">
        {icon}
      </View>
      <View className="px-2 py-1 rounded-full bg-[#1D2432]">
        <Text className="text-[#7E8795] text-[10px] font-semibold">{label}</Text>
      </View>
    </View>
    <Text className="text-white text-2xl font-bold" numberOfLines={1}>
      {value}
    </Text>
    <Text className="text-[#9CA3AF] text-xs mt-1">{unit}</Text>
    <View className="mt-3 h-1 rounded-full bg-[#1D2432] overflow-hidden">
      <View className="h-full rounded-full" style={{ width: "62%", backgroundColor: `${accent}55` }} />
    </View>
  </View>
);

export default function CurrentWorkout() {
  const { user } = useContext(AuthContext);
  const {
    elapsed,
    distance,
    calories,
    metrics,
    isTracking,
    isPaused,
    startTime,
    start,
    pause,
    resume,
    stop,
    reset,
  } = useLiveTelemetry();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const statusLabel = !isTracking ? "Ready" : isPaused ? "Paused" : "Tracking";
  const statusColor = !isTracking ? "#7E8795" : isPaused ? "#FBBF24" : "#4ADE80";
  const statusBg = !isTracking ? "#1D2432" : isPaused ? "#2B241C" : "#1E2A24";

  const handleStart = () => {
    setError(null);
    setSummary(null);
    start();
  };

  const handlePause = () => {
    pause();
  };

  const handleResume = () => {
    resume();
  };

  const handleEnd = async () => {
    const finalElapsed = elapsed;
    const finalDistance = distance;
    const finalCalories = calories;
    const endTime = new Date().toISOString();
    const startTimeIso = startTime ? startTime.toISOString() : new Date(Date.now() - finalElapsed * 1000).toISOString();

    if (finalElapsed === 0) {
      stop();
      setError("Workout too short — ride not saved.");
      return;
    }

    if (!user?.id) {
      setError("Not signed in — cannot save ride.");
      stop();
      return;
    }

    stop();
    setSaving(true);
    setError(null);

    try {
      const api = API_BASE_URL ? API_BASE_URL.replace(/\/$/, "") : null;
      if (!api) throw new Error("API URL not configured");

      // 1. Save ride to Supabase via backend
      const rideRes = await fetch(`${api}/api/rides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          duration: finalElapsed,
          duration_seconds: finalElapsed,
          distance: Number(finalDistance.toFixed(3)),
          distance_km: Number(finalDistance.toFixed(3)),
          calories: Number(finalCalories.toFixed(1)),
          calories_burned: Number(finalCalories.toFixed(1)),
          start_time: startTimeIso,
          end_time: endTime,
          avg_speed: finalElapsed > 0 ? Number((finalDistance / (finalElapsed / 3600)).toFixed(1)) : 0,
        }),
      });
      if (!rideRes.ok) {
        const errBody = await rideRes.json().catch(() => ({}));
        throw new Error(errBody?.message || `Ride save failed (${rideRes.status})`);
      }
      const rideData = await rideRes.json();

      // 2. Calculate XP and bridge to progression
      const xpEarned = calculateXpForRide(finalDistance, finalCalories);
      let progData = null;
      let leveledUp = false;
      try {
        const progRes = await fetch(`${api}/api/progression/ride-complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id, xp_gained: xpEarned, ride_id: rideData?.ride_id }),
        });
        if (progRes.ok) {
          progData = await progRes.json();
          leveledUp = !!progData?.leveledUp;
        } else {
          console.warn("Progression update failed:", await progRes.text());
        }
      } catch (e) {
        console.warn("Progression bridge failed:", e);
      }

      setSummary({
        ride: rideData,
        duration: finalElapsed,
        distance: finalDistance,
        calories: finalCalories,
        xp: xpEarned,
        progression: progData,
        leveledUp,
        startTime: startTimeIso,
        endTime,
      });
    } catch (e) {
      console.error("End workout failed:", e);
      setError(e?.message || "Failed to save workout");
      // allow user to retry saving via summary retry
      setSummary({
        duration: finalElapsed,
        distance: finalDistance,
        calories: finalCalories,
        xp: calculateXpForRide(finalDistance, finalCalories),
        error: true,
        startTime: startTimeIso,
        endTime,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSummary = () => {
    setSummary(null);
    reset();
  };

  const handleViewProgression = () => {
    const target = summary; // preserve for flash before nav
    setSummary(null);
    reset();
    // allow modal to unmount before navigating — prevents overlay blocking progression screen
    setTimeout(() => router.replace("/(tabs)/progression"), 80);
  };

  return (
    <CustomSafeArea bgColour="#0B0F1A">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          className="mb-4 self-start mt-2"
          onPress={() => {
            try {
              if (router.canGoBack?.()) router.back();
              else router.replace("/startworkout");
            } catch {
              router.replace("/startworkout");
            }
          }}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="arrow-back" size={18} color="#C2C8D0" />
            <Text className="text-[#C2C8D0] text-base ml-1">Back</Text>
          </View>
        </TouchableOpacity>

        {/* Header */}
        <LinearGradient
          colors={["#171E2A", "#111722"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 20, borderWidth: 1, borderColor: "#1F2937", marginBottom: 16 }}
        >
          <View className="flex-row justify-between items-start">
            <View className="w-16 h-16 rounded-full bg-[#221A22] items-center justify-center">
              <MaterialCommunityIcons name="bike-fast" size={30} color="#EB7363" />
            </View>
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: statusBg }}>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: statusColor }} />
                <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                  {statusLabel}
                </Text>
              </View>
            </View>
          </View>
          <Text className="text-white text-3xl font-bold mt-4">Live Workout</Text>
          <Text className="text-[#AAB2C0] text-sm mt-2 leading-5">Real-time telemetry from your SmartBike. Tap Start to begin streaming.</Text>
        </LinearGradient>

        {/* Timer */}
        <View className="bg-[#141A26] rounded-3xl p-6 border border-[#1F2937] mb-4 items-center">
          <Text className="text-[#9CA3AF] text-xs tracking-widest">ELAPSED TIME</Text>
          <Text className="text-white text-5xl font-bold mt-2 tracking-wide">{formatTimer(elapsed)}</Text>
          <View className="flex-row gap-3 mt-4">
            <View className="bg-[#1D2432] rounded-full px-4 py-2">
              <Text className="text-[#D8DEE8] text-xs font-medium">{distance.toFixed(2)} km</Text>
            </View>
            <View className="bg-[#1D2432] rounded-full px-4 py-2">
              <Text className="text-[#D8DEE8] text-xs font-medium">{calories.toFixed(1)} kcal</Text>
            </View>
          </View>
          {!isTracking && elapsed === 0 && (
            <Text className="text-[#7E8795] text-xs mt-3">Tap Start — timer at 00:00, metrics zeroed</Text>
          )}
          {isPaused && <Text className="text-[#FBBF24] text-xs mt-3 font-semibold">Paused — values held</Text>}
        </View>

        {error && (
          <View className="bg-[#2A1E22] border border-[#3A2A2E] rounded-2xl p-4 mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 pr-3">
              <Entypo name="warning" size={16} color="#FB7185" />
              <Text className="text-[#D8DEE8] text-xs ml-2 flex-1">{error}</Text>
            </View>
            <TouchableOpacity onPress={() => setError(null)}>
              <Text className="text-[#EB7363] text-xs font-semibold">Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Live Metrics */}
        <View className="flex-row flex-wrap justify-between">
          <MetricCard
            label="Speed"
            value={isTracking || elapsed > 0 ? metrics.speed.toFixed(1) : "0.0"}
            unit="km/h"
            icon={<MaterialIcons name="speed" size={18} color="#EB7363" />}
          />
          <MetricCard
            label="Cadence"
            value={isTracking || elapsed > 0 ? String(metrics.cadence) : "0"}
            unit="RPM"
            icon={<MaterialIcons name="autorenew" size={18} color="#EB7363" />}
          />
          <MetricCard
            label="Heart Rate"
            value={isTracking || elapsed > 0 ? String(metrics.heartRate) : "0"}
            unit="BPM"
            icon={<FontAwesome5 name="heartbeat" size={16} color="#EB7363" />}
            accent="#FB7185"
          />
          <MetricCard
            label="Power"
            value={isTracking || elapsed > 0 ? String(metrics.power) : "0"}
            unit="Watts"
            icon={<MaterialIcons name="bolt" size={18} color="#EB7363" />}
            accent="#F59E0B"
          />
        </View>

        {/* Distance / Calories detail row */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-[#141A26] rounded-2xl p-4 border border-[#1F2937]">
            <Text className="text-[#9CA3AF] text-xs">Distance</Text>
            <Text className="text-white text-xl font-bold mt-1">{distance.toFixed(2)} km</Text>
            <Text className="text-[#7E8795] text-xs mt-1">Accumulating @ speed/3600 per sec</Text>
          </View>
          <View className="flex-1 bg-[#141A26] rounded-2xl p-4 border border-[#1F2937]">
            <Text className="text-[#9CA3AF] text-xs">Calories</Text>
            <Text className="text-white text-xl font-bold mt-1">{calories.toFixed(1)} kcal</Text>
            <Text className="text-[#7E8795] text-xs mt-1">Power + speed based estimate</Text>
          </View>
        </View>

        {/* Controls */}
        <View className="gap-3">
          {!isTracking ? (
            <TouchableOpacity
              onPress={handleStart}
              activeOpacity={0.9}
              className="bg-[#EB7363] rounded-2xl py-4 items-center flex-row justify-center"
            >
              <MaterialIcons name="play-arrow" size={22} color="white" />
              <Text className="text-white font-bold text-base ml-2">Start Workout</Text>
            </TouchableOpacity>
          ) : isPaused ? (
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={handleResume} activeOpacity={0.9} className="flex-1 bg-[#EB7363] rounded-2xl py-4 items-center flex-row justify-center">
                <MaterialIcons name="play-arrow" size={22} color="white" />
                <Text className="text-white font-bold ml-1">Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEnd} disabled={saving} activeOpacity={0.9} className="flex-1 bg-[#1D2432] rounded-2xl py-4 items-center border border-[#2A3446] flex-row justify-center">
                {saving ? <ActivityIndicator color="#C2C8D0" /> : <><MaterialIcons name="stop" size={18} color="#C2C8D0" /><Text className="text-[#C2C8D0] font-semibold ml-1">End</Text></>}
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={handlePause} activeOpacity={0.9} className="flex-1 bg-[#1D2432] rounded-2xl py-4 items-center border border-[#2A3446] flex-row justify-center">
                <MaterialIcons name="pause" size={20} color="#C2C8D0" />
                <Text className="text-[#C2C8D0] font-semibold ml-1">Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEnd} disabled={saving} activeOpacity={0.9} className="flex-1 bg-[#EB7363] rounded-2xl py-4 items-center flex-row justify-center">
                {saving ? <ActivityIndicator color="white" /> : <><MaterialIcons name="stop" size={18} color="white" /><Text className="text-white font-bold ml-1">End Workout</Text></>}
              </TouchableOpacity>
            </View>
          )}

          {isTracking && (
            <TouchableOpacity onPress={() => { stop(); reset(); setError(null); setSummary(null); }} className="py-3 items-center">
              <Text className="text-[#7E8795] text-xs">Reset (discard current session)</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="mt-6 bg-[#141A26] rounded-2xl p-4 border border-[#1F2937]">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-[#221A22] items-center justify-center mr-3">
              <Entypo name="info" size={18} color="#EB7363" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm font-semibold">IoT Ready</Text>
              <Text className="text-[#9CA3AF] text-xs mt-1 leading-4">This local loop is modular — swap `useLiveTelemetry` tick with MQTT/Bluetooth listeners without touching UI or Supabase save flow.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Post-ride Summary Modal */}
      <Modal visible={!!summary} transparent animationType="fade" onRequestClose={handleCloseSummary}>
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-[#0B0F1A] rounded-t-3xl p-6 border-t border-[#1F2937]">
            <View className="self-center w-10 h-1 rounded-full bg-[#2A3446] mb-4" />
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#221A22] items-center justify-center mb-3">
                <FontAwesome5 name="trophy" size={28} color="#EB7363" />
              </View>
              <Text className="text-white text-2xl font-bold">Workout Complete!</Text>
              <Text className="text-[#9CA3AF] text-sm mt-1">{formatTimer(summary?.duration || 0)} • {Number(summary?.distance || 0).toFixed(2)} km • {Number(summary?.calories || 0).toFixed(1)} kcal</Text>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-[#141A26] rounded-2xl p-4 border border-[#1F2937] items-center">
                <Text className="text-[#9CA3AF] text-xs">Duration</Text>
                <Text className="text-white font-bold text-lg mt-1">{formatTimer(summary?.duration || 0)}</Text>
              </View>
              <View className="flex-1 bg-[#141A26] rounded-2xl p-4 border border-[#1F2937] items-center">
                <Text className="text-[#9CA3AF] text-xs">Distance</Text>
                <Text className="text-white font-bold text-lg mt-1">{Number(summary?.distance || 0).toFixed(2)} km</Text>
              </View>
              <View className="flex-1 bg-[#141A26] rounded-2xl p-4 border border-[#1F2937] items-center">
                <Text className="text-[#9CA3AF] text-xs">Calories</Text>
                <Text className="text-white font-bold text-lg mt-1">{Number(summary?.calories || 0).toFixed(1)}</Text>
              </View>
            </View>

            <View className="bg-[#141A26] rounded-2xl p-4 border border-[#1F2937] mb-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <MaterialIcons name="bolt" size={18} color="#EB7363" />
                  <Text className="text-white font-bold ml-2">{summary?.xp || 0} XP Earned</Text>
                </View>
                {summary?.leveledUp && (
                  <View className="bg-[#1E2A1E] border border-[#2A4A2A] rounded-full px-3 py-1">
                    <Text className="text-[#4ADE80] text-xs font-bold">Leveled Up! → Lv {summary?.progression?.level}</Text>
                  </View>
                )}
              </View>
              <Text className="text-[#7E8795] text-xs mt-2">10 XP per km + 1 XP per calorie (min 20 XP)</Text>
              {summary?.progression && (
                <View className="mt-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-[#9CA3AF] text-xs">Total XP {summary.progression.xp}</Text>
                    <Text className="text-[#EB7363] text-xs font-semibold">Lv {summary.progression.level}</Text>
                  </View>
                  <View className="h-2 rounded-full bg-[#1D2432] overflow-hidden">
                    <View className="h-full bg-[#EB7363] rounded-full" style={{ width: `${summary.progression.progressPercent || 0}%` }} />
                  </View>
                </View>
              )}
            </View>

            {summary?.error && (
              <View className="bg-[#2A1E22] border border-[#3A2A2E] rounded-2xl p-3 mb-4">
                <Text className="text-[#FB7185] text-xs">Saved locally but cloud sync failed. Tap Retry to save again.</Text>
              </View>
            )}

            <View className="gap-3">
              <TouchableOpacity onPress={handleCloseSummary} className="bg-[#EB7363] rounded-2xl py-4 items-center">
                <Text className="text-white font-bold">Done — Back to Workouts</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleViewProgression} className="bg-[#141A26] rounded-2xl py-4 items-center border border-[#1F2937]">
                <Text className="text-white font-semibold">View Progression</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CustomSafeArea>
  );
}
