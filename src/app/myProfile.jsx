import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, Stack } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import CustomSafeArea from "@/components/CustomSafeArea";
import { AuthContext } from "@/context/authContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function UserDetails() {
  const { user, setUser, loading } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [dob, setDob] = useState(user?.dob || "");

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [dobError, setDobError] = useState("");

  // Progression state — fetched from /api/progression
  const [progression, setProgression] = useState(null);
  const [progLoading, setProgLoading] = useState(true);

  const fallbackLevel = (xp) => Math.floor((Number(xp) || 0) / 100) + 1;

  useEffect(() => {
    let mounted = true;
    const fetchProgression = async () => {
      if (!user?.id) {
        setProgLoading(false);
        return;
      }
      // Prefer backend; fallback to fields on user object
      if (!API_BASE_URL) {
        const xp = Number(user?.xp) || 0;
        if (mounted) {
          setProgression({
            level: user?.level ?? fallbackLevel(xp),
            xp,
            streak_days: Number(user?.streak_days) || 0,
            currentLevelXp: xp % 100,
            xpToNextLevel: 100 - (xp % 100),
            progressPercent: Math.round(((xp % 100) / 100) * 100),
          });
          setProgLoading(false);
        }
        return;
      }
      try {
        const url = `${API_BASE_URL.replace(/\/$/, "")}/api/progression/${encodeURIComponent(user.id)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Progression API ${res.status}`);
        const data = await res.json();
        if (mounted) setProgression(data);
      } catch {
        // Backend not yet migrated or offline — derive from user object
        const xp = Number(user?.xp) || 0;
        if (mounted) {
          setProgression({
            level: user?.level ?? fallbackLevel(xp),
            xp,
            streak_days: Number(user?.streak_days) || 0,
            currentLevelXp: xp % 100,
            xpToNextLevel: 100 - (xp % 100),
            progressPercent: Math.round(((xp % 100) / 100) * 100),
          });
        }
      } finally {
        if (mounted) setProgLoading(false);
      }
    };
    fetchProgression();
    return () => {
      mounted = false;
    };
  }, [user?.id, user?.xp, user?.level, user?.streak_days]);

  const profile = {
    photo: user?.photo || "https://i.pravatar.cc/150?img=5",
    stravaLink: user?.stravaLink || "https://www.strava.com",
  };

  const level = progression?.level ?? fallbackLevel(progression?.xp);
  const xp = Number(progression?.xp) || 0;
  const streakDays = Number(progression?.streak_days) || 0;
  const currentLevelXp = Number(progression?.currentLevelXp ?? xp % 100) || 0;
  const xpToNext = Number(progression?.xpToNextLevel ?? 100 - (xp % 100)) || 0;
  const progressPercent = Number(progression?.progressPercent ?? Math.round((currentLevelXp / 100) * 100)) || 0;

  const handleStravaPress = () => {
    Linking.openURL(profile.stravaLink);
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSave = () => {
    let valid = true;

    setUsernameError("");
    setEmailError("");
    setDobError("");

    if (!username.trim()) {
      setUsernameError("Username cannot be empty");
      valid = false;
    }

    if (!email.trim()) {
      setEmailError("Email cannot be empty");
      valid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email");
      valid = false;
    }

    if (!dob.trim()) {
      setDobError("Birthday cannot be empty");
      valid = false;
    }

    if (!valid) return;

    if (setUser) {
      setUser({
        ...user,
        username: username.trim(),
        email: email.trim(),
        dob: dob.trim(),
      });
    }

    setIsEditing(false);
    Alert.alert("Saved", "Profile details updated successfully.");
  };

  if (loading) {
    return (
      <CustomSafeArea>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3A1C72" />
        </View>
      </CustomSafeArea>
    );
  }

  if (!user) {
    return (
      <CustomSafeArea>
        <View style={styles.centered}>
          <Text>No user found</Text>
        </View>
      </CustomSafeArea>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <CustomSafeArea>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/settings")}
          >
            <AntDesign name="arrowleft" size={22} color="white" />
          </TouchableOpacity>

          <Image source={{ uri: profile.photo }} style={styles.avatar} />

          <Text style={styles.name}>{username || "Username"}</Text>

          {/* Player Progression — Level / XP / Streak */}
          <View style={styles.progressionCard}>
            <Text style={styles.progressionTitle}>Player Progression</Text>
            {progLoading ? (
              <ActivityIndicator size="small" color="#ff7a6b" style={{ marginVertical: 12 }} />
            ) : (
              <>
                <View style={styles.progressionRow}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>Lv {level}</Text>
                  </View>
                  <View style={styles.progressionStats}>
                    <Text style={styles.progressionXp}>{xp} XP</Text>
                    <Text style={styles.progressionSub}>{currentLevelXp} / 100 to next level</Text>
                  </View>
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>🔥 {streakDays} day streak</Text>
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.progressLabel}>
                  {progressPercent}% to Level {level + 1} • {xpToNext} XP needed
                </Text>
              </>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.cardTitle}>Profile Details</Text>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setIsEditing(!isEditing);
                  setUsernameError("");
                  setEmailError("");
                  setDobError("");
                }}
              >
                <Text style={styles.editButtonText}>
                  {isEditing ? "Cancel" : "Edit"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Username</Text>
            {isEditing ? (
              <>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                  autoCapitalize="none"
                />
                {usernameError ? (
                  <Text style={styles.errorText}>{usernameError}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.staticValue}>{username || "Not set"}</Text>
            )}

            <Text style={styles.label}>Email</Text>
            {isEditing ? (
              <>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.staticValue}>{email || "Not set"}</Text>
            )}

            <Text style={styles.label}>Birthday</Text>
            {isEditing ? (
              <>
                <TextInput
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                />
                {dobError ? (
                  <Text style={styles.errorText}>{dobError}</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.staticValue}>{dob || "Not set"}</Text>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.stravaButton}
            onPress={handleStravaPress}
          >
            <Text style={styles.buttonText}>View on Strava</Text>
          </TouchableOpacity>
        </View>
      </CustomSafeArea>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    alignItems: "center",
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 16,
    zIndex: 100,
    elevation: 10,
    padding: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginTop: 40,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#101010",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#1f1f1f",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  editButtonText: {
    color: "#ff7a6b",
    fontWeight: "600",
  },
  label: {
    color: "#d1d5db",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#181818",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 6,
  },
  staticValue: {
    color: "white",
    fontSize: 16,
    backgroundColor: "#181818",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginBottom: 10,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 13,
    marginBottom: 6,
  },
  saveButton: {
    backgroundColor: "#8e4b74",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    marginBottom: 12,
  },
  stravaButton: {
    backgroundColor: "#ff7a6b",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  progressionCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#101010",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  progressionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  progressionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  levelBadge: {
    backgroundColor: "#ff7a6b",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeText: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
  progressionStats: {
    flex: 1,
    alignItems: "center",
  },
  progressionXp: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  progressionSub: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: "#181818",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  streakText: {
    color: "#ff7a6b",
    fontWeight: "600",
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#181818",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ff7a6b",
    borderRadius: 999,
  },
  progressLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
});
