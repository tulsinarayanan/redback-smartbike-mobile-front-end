import { friends as friendSource } from "@/features/friends/data";

export const initialFriends = friendSource;

const EMPTY_LEADERBOARD_STATS = {
  distance: 0,
  points: 0,
  rides: 0,
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const getPeriodStats = (rider, timeframe = "weekly") => {
  const stats = rider?.leaderboardStats?.[timeframe];

  return {
    distance: toNumber(stats?.distance, EMPTY_LEADERBOARD_STATS.distance),
    points: toNumber(stats?.points, EMPTY_LEADERBOARD_STATS.points),
    rides: toNumber(stats?.rides, EMPTY_LEADERBOARD_STATS.rides),
  };
};

const getPeriodStart = (timeframe = "weekly", now = new Date()) => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (timeframe === "weekly") {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
  }

  if (timeframe === "monthly") {
    start.setDate(1);
  }

  return start;
};

const getRideUserId = (ride) =>
  ride?.user_id ?? ride?.profile_id ?? ride?.rider_id ?? ride?.userId;

const getRideDistance = (ride) =>
  toNumber(ride?.distance_km ?? ride?.distanceKm ?? ride?.distance);

const getRidePoints = (ride) => {
  const explicitPoints = ride?.points;

  if (explicitPoints !== undefined && explicitPoints !== null) {
    return toNumber(explicitPoints);
  }

  return Math.round(getRideDistance(ride) * 10);
};

const getRideDate = (ride) => {
  const rawDate = ride?.started_at ?? ride?.created_at ?? ride?.date;
  const date = rawDate ? new Date(rawDate) : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
};

export const buildLeaderboardRows = ({
  profiles = [],
  rides = [],
  timeframe = "weekly",
  currentUserId,
} = {}) => {
  const periodStart = getPeriodStart(timeframe);
  const periodEnd = new Date();

  const rows = profiles.map((profile) => {
    const profileId = profile?.id ?? profile?.user_id ?? profile?.userId;
    const profileRides = rides.filter((ride) => {
      const rideDate = getRideDate(ride);

      return (
        String(getRideUserId(ride)) === String(profileId) &&
        rideDate &&
        rideDate >= periodStart &&
        rideDate <= periodEnd
      );
    });

    const distance = profileRides.reduce(
      (total, ride) => total + getRideDistance(ride),
      0
    );
    const points = profileRides.reduce(
      (total, ride) => total + getRidePoints(ride),
      0
    );

    return {
      id: String(profileId),
      name:
        profile?.username ||
        profile?.name ||
        profile?.full_name ||
        profile?.email?.split("@")[0] ||
        "Rider",
      photo:
        profile?.avatar_url ||
        profile?.photo ||
        "https://i.pravatar.cc/150?img=14",
      email: profile?.email || "",
      status: profile?.status || "Rider",
      badge: profile?.badge || "Cyclist",
      isCurrentUser: String(profileId) === String(currentUserId),
      distance,
      points,
      periodRides: profileRides.length,
    };
  });

  return rows
    .sort((first, second) => {
      if (second.points !== first.points) {
        return second.points - first.points;
      }

      return second.distance - first.distance;
    })
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
};

const createCurrentRider = (username = "Username") => ({
  id: "self",
  name: username || "Username",
  photo: "https://i.pravatar.cc/150?img=14",
  email: "username@example.com",
  dob: "1997-11-02",
  status: "Rising",
  rides: 22,
  weeklyDistance: 68.7,
  points: 2210,
  badge: "Consistency",
  leaderboardStats: {
    daily: {
      distance: 12.1,
      points: 430,
      rides: 1,
    },
    weekly: {
      distance: 68.7,
      points: 2210,
      rides: 5,
    },
    monthly: {
      distance: 287.9,
      points: 8485,
      rides: 22,
    },
  },
});

export const getLeaderboardData = (
  timeframe = "weekly",
  username = "Username"
) => {
  const riders = [...initialFriends, createCurrentRider(username)];

  return riders
    .sort((first, second) => {
      const firstStats = getPeriodStats(first, timeframe);
      const secondStats = getPeriodStats(second, timeframe);

      if (secondStats.points !== firstStats.points) {
        return secondStats.points - firstStats.points;
      }

      return secondStats.distance - firstStats.distance;
    })
    .map((rider, index) => ({
      ...rider,
      distance: getPeriodStats(rider, timeframe).distance,
      points: getPeriodStats(rider, timeframe).points,
      periodRides: getPeriodStats(rider, timeframe).rides,
      rank: index + 1,
    }));
};
