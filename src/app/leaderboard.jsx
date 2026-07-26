import React, { useContext, useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import CustomSafeArea from "@/components/CustomSafeArea";
import { AuthContext } from "@/context/authContext";
import { getLeaderboardData } from "../../friendsdata/data";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK_PHOTO = "https://i.pravatar.cc/150?img=14";

const leaderboardPeriods = [
  {
    key: "daily",
    label: "Daily",
    title: "Daily standings",
    sectionTitle: "Today's Riders",
    description: "Today's mock standings from your riding circle",
    distanceLabel: "Today's Distance",
    distanceSuffix: "today",
    ridesSuffix: "rides today",
    challengeTitle: "Daily Sprint Challenge",
    challengeGoal: 15,
    challengeUnit: "km",
    challengeReward: "120 bonus pts",
    challengeTip: "A short extra ride could move you up before the day ends.",
  },
  {
    key: "weekly",
    label: "Weekly",
    title: "Weekly standings",
    sectionTitle: "This Week's Riders",
    description: "This week's mock standings linked to your friends list data",
    distanceLabel: "Weekly Distance",
    distanceSuffix: "this week",
    ridesSuffix: "rides this week",
    challengeTitle: "Weekly Climb Challenge",
    challengeGoal: 75,
    challengeUnit: "km",
    challengeReward: "350 bonus pts",
    challengeTip: "A strong final session can change the whole weekly table.",
  },
  {
    key: "monthly",
    label: "Monthly",
    title: "Monthly standings",
    sectionTitle: "This Month's Riders",
    description: "This month's mock standings across your riding network",
    distanceLabel: "Monthly Distance",
    distanceSuffix: "this month",
    ridesSuffix: "rides this month",
    challengeTitle: "Monthly Endurance Challenge",
    challengeGoal: 320,
    challengeUnit: "km",
    challengeReward: "900 bonus pts",
    challengeTip: "Consistency across the month matters more than one big ride.",
  },
];

const getRankStyle = (rank) => {
  switch (rank) {
    case 1:
      return {
        card: "#1B1610",
        border: "#D4AF37",
        badgeBg: "#3A2E16",
        badgeText: "#F5D27A",
        rankBg: "#473616",
        rankText: "#F5D27A",
        label: "Gold",
      };
    case 2:
      return {
        card: "#161B23",
        border: "#A7B0BE",
        badgeBg: "#27303C",
        badgeText: "#E5E7EB",
        rankBg: "#2C3744",
        rankText: "#E5E7EB",
        label: "Silver",
      };
    case 3:
      return {
        card: "#1B1512",
        border: "#C47A44",
        badgeBg: "#39241B",
        badgeText: "#F2B07A",
        rankBg: "#492C1E",
        rankText: "#F2B07A",
        label: "Bronze",
      };
    default:
      return {
        card: "#141A26",
        border: "#1F2937",
        badgeBg: "#1D2432",
        badgeText: "#AAB2C0",
        rankBg: "#1D2432",
        rankText: "#D7DCE4",
        label: "Rider",
      };
  }
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Online":
      return {
        bg: "#1E2A24",
        text: "#4ADE80",
      };
    case "Active":
      return {
        bg: "#2B241C",
        text: "#FBBF24",
      };
    case "Rising":
      return {
        bg: "#2A1E22",
        text: "#FB7185",
      };
    default:
      return {
        bg: "#1D2432",
        text: "#AAB2C0",
      };
  }
};

const SummaryCard = ({ icon, title, value, subtitle }) => {
  return (
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
};

const PodiumCard = ({ rider }) => {
  const rankStyle = getRankStyle(rider.rank);

  return (
    <View
      className="w-48 rounded-3xl p-4 border mr-3"
      style={{
        backgroundColor: rankStyle.card,
        borderColor: rankStyle.border,
      }}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: rankStyle.badgeBg }}
        >
          <Text
            className="text-[10px] font-semibold"
            style={{ color: rankStyle.badgeText }}
          >
            #{rider.rank} {rankStyle.label}
          </Text>
        </View>
        <FontAwesome5 name="trophy" size={16} color={rankStyle.rankText} />
      </View>

      <Image source={{ uri: rider.photo }} className="w-14 h-14 rounded-full mb-3" />

      <Text className="text-white text-base font-semibold">{rider.name}</Text>
      <Text className="text-[#9CA3AF] text-xs mt-1">{rider.badge}</Text>

      <View className="mt-4 bg-[#111722] rounded-2xl px-3 py-3">
        <Text className="text-[#8A94A6] text-[11px]">Score</Text>
        <Text className="text-white text-lg font-bold mt-1">
          {rider.points.toLocaleString()} pts
        </Text>
        <Text className="text-[#8A94A6] text-[11px] mt-1">
          {rider.distance.toFixed(1)} km
        </Text>
      </View>
    </View>
  );
};

const InsightCard = ({ title, value, subtitle, accent = "#EB7363" }) => {
  return (
    <View className="w-[48.5%] bg-[#141A26] rounded-2xl p-4 border border-[#1F2937]">
      <View
        className="w-10 h-10 rounded-2xl items-center justify-center mb-3"
        style={{ backgroundColor: `${accent}20` }}
      >
        <View
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </View>
      <Text className="text-[#9CA3AF] text-xs">{title}</Text>
      <Text className="text-white text-lg font-bold mt-2">{value}</Text>
      <Text className="text-[#7E8795] text-xs mt-1">{subtitle}</Text>
    </View>
  );
};

const ProgressCard = ({ activeConfig, currentRider, leaderGap, progressRatio }) => {
  return (
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
          <Text className="text-white text-lg font-semibold">Your Momentum</Text>
          <Text className="text-[#9CA3AF] text-sm mt-1">
            Track your pace and see how close you are to your next jump.
          </Text>
        </View>

        <View className="px-3 py-1 rounded-full bg-[#221A22]">
          <Text className="text-[#EB7363] text-[10px] font-semibold">
            Live Preview
          </Text>
        </View>
      </View>

      <View className="bg-[#141A26] rounded-2xl p-4 border border-[#1F2937]">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[#9CA3AF] text-xs">
            {activeConfig.challengeTitle}
          </Text>
          <Text className="text-white text-sm font-semibold">
            {currentRider?.distance.toFixed(1) ?? "0.0"} /{" "}
            {activeConfig.challengeGoal} {activeConfig.challengeUnit}
          </Text>
        </View>

        <View className="h-3 rounded-full bg-[#1D2432] overflow-hidden">
          <View
            className="h-full rounded-full bg-[#EB7363]"
            style={{ width: `${Math.min(progressRatio * 100, 100)}%` }}
          />
        </View>

        <View className="flex-row justify-between mt-3">
          <Text className="text-[#7E8795] text-xs">
            Reward: {activeConfig.challengeReward}
          </Text>
          <Text className="text-[#7E8795] text-xs">
            {leaderGap > 0 ? `${leaderGap} pts to leader` : "You're in front"}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3 mt-4">
        <View className="flex-1 bg-[#141A26] rounded-2xl p-4 border border-[#1F2937]">
          <Text className="text-[#9CA3AF] text-xs">Current Badge</Text>
          <Text className="text-white text-lg font-bold mt-2">
            {currentRider?.badge ?? "Consistency"}
          </Text>
          <Text className="text-[#7E8795] text-xs mt-1">
            Based on your current leaderboard form
          </Text>
        </View>

        <View className="flex-1 bg-[#141A26] rounded-2xl p-4 border border-[#1F2937]">
          <Text className="text-[#9CA3AF] text-xs">Coach Note</Text>
          <Text className="text-white text-sm font-semibold mt-2 leading-5">
            {activeConfig.challengeTip}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const HighlightRow = ({ title, subtitle, icon, accent = "#EB7363" }) => {
  return (
    <View className="bg-[#141A26] rounded-2xl p-4 border border-[#1F2937] mb-3">
      <View className="flex-row items-center">
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: `${accent}1F` }}
        >
          {icon}
        </View>

        <View className="flex-1">
          <Text className="text-white text-sm font-semibold">{title}</Text>
          <Text className="text-[#9CA3AF] text-xs mt-1 leading-5">
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
};

const LeaderboardRow = ({ rider, activePeriod }) => {
  const rankStyle = getRankStyle(rider.rank);
  const statusStyle = getStatusStyle(rider.status);
  const activeConfig =
    leaderboardPeriods.find((period) => period.key === activePeriod) ??
    leaderboardPeriods[1];

  return (
    <View
      className="rounded-3xl p-4 mb-3 border"
      style={{
        backgroundColor: rankStyle.card,
        borderColor: rankStyle.border,
      }}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: rankStyle.rankBg }}
        >
          <Text
            className="text-base font-bold"
            style={{ color: rankStyle.rankText }}
          >
            #{rider.rank}
          </Text>
        </View>

        <Image
          source={{ uri: rider.photo }}
          className="w-14 h-14 rounded-full mr-3"
        />

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-white text-base font-semibold">
                {rider.name}
              </Text>
              <Text className="text-[#9CA3AF] text-xs mt-1">
                {rider.distance.toFixed(1)} km {activeConfig.distanceSuffix}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-white text-lg font-bold">
                {rider.points.toLocaleString()}
              </Text>
              <Text className="text-[#7E8795] text-xs">pts</Text>
            </View>
          </View>

          <View className="flex-row items-center mt-3">
            <View
              className="px-3 py-1 rounded-full mr-2"
              style={{ backgroundColor: statusStyle.bg }}
            >
              <Text
                className="text-[10px] font-semibold"
                style={{ color: statusStyle.text }}
              >
                {rider.status}
              </Text>
            </View>

            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: rankStyle.badgeBg }}
            >
              <Text
                className="text-[10px] font-semibold"
                style={{ color: rankStyle.badgeText }}
              >
                {rider.rank <= 3 ? rankStyle.label : rider.badge}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const normalizeLeaderboardRows = (rows) => {
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => ({
    id: row?.id ?? `leaderboard-${index}`,
    name: row?.name || row?.username || "Rider",
    photo: row?.photo || row?.avatar_url || FALLBACK_PHOTO,
    email: row?.email || "",
    status: row?.status || "Rising",
    badge: row?.badge || "Consistency",
    distance: toNumber(row?.distance),
    points: toNumber(row?.points),
    periodRides: toNumber(row?.periodRides),
    rank: toNumber(row?.rank) || index + 1,
  }));
};

export default function Leaderboard() {
  const { user } = useContext(AuthContext);
  const username = user?.username ? user.username : "Username";
  const [activePeriod, setActivePeriod] = useState("weekly");
  const [apiLeaderboard, setApiLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const activeConfig =
    leaderboardPeriods.find((period) => period.key === activePeriod) ??
    leaderboardPeriods[1];
  const mockLeaderboard = useMemo(
    () => getLeaderboardData(activePeriod, username),
    [activePeriod, username]
  );
  const leaderboard =
    !isLoadingLeaderboard && apiLeaderboard.length > 0
      ? apiLeaderboard
      : mockLeaderboard;
  const currentRider = leaderboard.find(
    (rider) =>
      String(rider.id) === String(user?.id) ||
      rider.id === "self" ||
      rider.isCurrentUser
  );
  const topRider = leaderboard[0];
  const currentRank = currentRider ? `#${currentRider.rank}` : "-";
  const currentPoints = currentRider ? currentRider.points.toLocaleString() : "0";
  const currentDistance = currentRider
    ? `${currentRider.distance.toFixed(1)} km`
    : "0.0 km";
  const currentRides = currentRider ? currentRider.periodRides : 0;
  const topRiderName = topRider ? topRider.name : "Jordan Anderson";
  const topRiderPoints = topRider ? topRider.points.toLocaleString() : "0";
  const topThree = leaderboard.slice(0, 3);
  const currentIndex = leaderboard.findIndex((rider) => rider.id === "self");
  const riderAhead = currentIndex > 0 ? leaderboard[currentIndex - 1] : null;
  const pointsToNext = riderAhead
    ? riderAhead.points - (currentRider?.points ?? 0)
    : 0;
  const distanceLeader = leaderboard.reduce((leader, rider) => {
    if (!leader || rider.distance > leader.distance) {
      return rider;
    }

    return leader;
  }, null);
  const averagePoints =
    leaderboard.length > 0
      ? Math.round(
          leaderboard.reduce((total, rider) => total + rider.points, 0) /
            leaderboard.length
        )
      : 0;
  const totalDistance = leaderboard.reduce(
    (total, rider) => total + rider.distance,
    0
  );
  const totalRides = leaderboard.reduce(
    (total, rider) => total + rider.periodRides,
    0
  );
  const leaderGap =
    topRider && currentRider ? Math.max(topRider.points - currentRider.points, 0) : 0;
  const challengeProgressRatio = currentRider
    ? currentRider.distance / activeConfig.challengeGoal
    : 0;

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      if (!API_BASE_URL) {
        console.warn("EXPO_PUBLIC_API_URL is not set. Using mock leaderboard.");
        setApiLeaderboard([]);
        return;
      }

      setIsLoadingLeaderboard(true);

      try {
        const url = `${API_BASE_URL.replace(/\/$/, "")}/api/leaderboard?timeframe=${encodeURIComponent(activePeriod)}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Leaderboard API returned ${response.status}`);
        }

        const data = await response.json();
        const rows = normalizeLeaderboardRows(data);

        if (isMounted) {
          setApiLeaderboard(rows.length > 0 ? rows : []);
        }
      } catch (error) {
        console.warn("Leaderboard API unavailable. Using mock data.", error);

        if (isMounted) {
          setApiLeaderboard([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingLeaderboard(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [activePeriod]);

  const highlightItems = [
    {
      title: `${topRiderName} is setting the pace`,
      subtitle: `${topRider?.distance.toFixed(1) ?? "0.0"} km and ${topRiderPoints} pts make them the rider to beat right now.`,
      icon: <FontAwesome5 name="trophy" size={16} color="#EB7363" />,
      accent: "#EB7363",
    },
    {
      title: `${totalRides} rides have been logged`,
      subtitle: `${totalDistance.toFixed(1)} km have been covered across this ${activePeriod} leaderboard view.`,
      icon: <MaterialIcons name="timeline" size={18} color="#22C55E" />,
      accent: "#22C55E",
    },
    {
      title: riderAhead
        ? `${riderAhead.name} is your next target`
        : "You're holding the top position",
      subtitle: riderAhead
        ? `A gain of ${pointsToNext} pts would move you ahead into rank #${riderAhead.rank}.`
        : "Keep riding to defend your lead and stay clear at the top of the table.",
      icon: <MaterialIcons name="trending-up" size={18} color="#60A5FA" />,
      accent: "#60A5FA",
    },
  ];

  return (
    <CustomSafeArea bgColour="#0B0F1A">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
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
            <MaterialIcons name="leaderboard" size={30} color="#EB7363" />
          </View>

          <Text className="text-white text-3xl font-bold">Leaderboard</Text>

          <Text className="text-[#AAB2C0] text-sm mt-2 leading-5">
            Compare your progress with friends and riders.
          </Text>

          <View className="mt-5 self-start px-4 py-2 rounded-full bg-[#1D2432]">
            <Text className="text-[#D8DEE8] text-xs font-medium">
              {isLoadingLeaderboard ? "Updating standings..." : activeConfig.title}
            </Text>
          </View>
        </LinearGradient>

        <View className="bg-[#141A26] rounded-2xl p-2 border border-[#1F2937] mb-5">
          <View className="flex-row">
            {leaderboardPeriods.map((period) => {
              const isActive = period.key === activePeriod;

              return (
                <TouchableOpacity
                  key={period.key}
                  activeOpacity={0.85}
                  onPress={() => setActivePeriod(period.key)}
                  className="flex-1 rounded-2xl py-3 items-center"
                  style={{
                    backgroundColor: isActive ? "#EB7363" : "transparent",
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: isActive ? "#FFFFFF" : "#9CA3AF" }}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <SummaryCard
            title="Your Rank"
            value={currentRank}
            subtitle={`${currentPoints} pts`}
            icon={<FontAwesome5 name="medal" size={18} color="#EB7363" />}
          />
          <SummaryCard
            title="Top Rider"
            value={topRiderName}
            subtitle={`${topRiderPoints} pts`}
            icon={<FontAwesome5 name="trophy" size={18} color="#EB7363" />}
          />
          <SummaryCard
            title={activeConfig.distanceLabel}
            value={currentDistance}
            subtitle={`${currentRides} ${activeConfig.ridesSuffix}`}
            icon={<MaterialIcons name="directions-bike" size={20} color="#EB7363" />}
          />
        </View>

        <View className="mb-3">
          <Text className="text-white text-lg font-semibold">Podium Focus</Text>
          <Text className="text-[#9CA3AF] text-sm mt-1">
            Quick highlights from the strongest riders in this view
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 4, marginBottom: 24 }}
        >
          {topThree.map((rider) => (
            <PodiumCard key={rider.id.toString()} rider={rider} />
          ))}
        </ScrollView>

        <View className="mb-3">
          <Text className="text-white text-lg font-semibold">Insights</Text>
          <Text className="text-[#9CA3AF] text-sm mt-1">
            A few extra details to make the leaderboard feel more alive
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
          <InsightCard
            title="Riders Tracked"
            value={`${leaderboard.length}`}
            subtitle="Friends and your own profile included"
            accent="#EB7363"
          />
          <InsightCard
            title="Average Score"
            value={`${averagePoints.toLocaleString()} pts`}
            subtitle={`Across the ${activePeriod} leaderboard`}
            accent="#F59E0B"
          />
          <InsightCard
            title="Distance Leader"
            value={distanceLeader?.name ?? "Jordan Anderson"}
            subtitle={`${distanceLeader?.distance.toFixed(1) ?? "0.0"} km covered`}
            accent="#22C55E"
          />
          <InsightCard
            title="Next Position"
            value={riderAhead ? `${pointsToNext} pts away` : "You're leading"}
            subtitle={
              riderAhead
                ? `Catch ${riderAhead.name} for rank #${riderAhead.rank}`
                : "Hold your place at the top"
            }
            accent="#60A5FA"
          />
        </View>

        <ProgressCard
          activeConfig={activeConfig}
          currentRider={currentRider}
          leaderGap={leaderGap}
          progressRatio={challengeProgressRatio}
        />

        <View className="mb-3">
          <Text className="text-white text-lg font-semibold">
            Recent Highlights
          </Text>
          <Text className="text-[#9CA3AF] text-sm mt-1">
            Extra context around the leaderboard to make the page feel more active
          </Text>
        </View>

        <View className="mb-6">
          {highlightItems.map((item) => (
            <HighlightRow
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              accent={item.accent}
            />
          ))}
        </View>

        <View className="mb-3">
          <Text className="text-white text-lg font-semibold">
            {activeConfig.sectionTitle}
          </Text>
          <Text className="text-[#9CA3AF] text-sm mt-1">
            {activeConfig.description}
          </Text>
        </View>

        {leaderboard.map((rider) => (
          <LeaderboardRow
            key={rider.id.toString()}
            rider={rider}
            activePeriod={activePeriod}
          />
        ))}
      </ScrollView>
    </CustomSafeArea>
  );
}
