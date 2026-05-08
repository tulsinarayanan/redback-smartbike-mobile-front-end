import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CustomSafeArea from "@/components/CustomSafeArea";
import { initialFriends } from "../../../friendsdata/data";

const friendGradients = [
  ["#F4D2D2", "#FF4D4D"],
  ["#D8D4FF", "#5E5CE6"],
  ["#F6D3A8", "#FF9800"],
  ["#F8CAE0", "#F45BB4"],
  ["#CBE8E8", "#28BDBD"],
  ["#CFE9C9", "#49D95B"],
  ["#CFE0FF", "#2F80FF"],
  ["#D7D0FF", "#6A5AE0"],
];

const FriendsList = () => {
  const [search, setSearch] = useState("");

  const filteredFriends = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return initialFriends;

    return initialFriends.filter(
      (friend) =>
        friend.name.toLowerCase().includes(query) ||
        friend.email.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <CustomSafeArea bgColour="#F3F3F3">
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Friends</Text>
          <TouchableOpacity style={styles.headerIconButton}>
            <MaterialIcons name="group-add" size={28} color="#111" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#7B7B7B" />
          <TextInput
            placeholder="Search friends"
            placeholderTextColor="#8A8A8A"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const colors = friendGradients[index % friendGradients.length];

            return (
              <TouchableOpacity
                style={styles.cardWrap}
                activeOpacity={0.9}
                onPress={() => router.push(`/chat/${item.id}`)}
              >
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.card}
                >
                  <Image source={{ uri: item.photo }} style={styles.avatar} />

                  <View style={styles.cardBottomRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {item.email}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={28}
                      color="#fff"
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </CustomSafeArea>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#340C4C",
  },
  headerIconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#222",
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  cardWrap: {
    width: "48.3%",
    marginBottom: 16,
  },
  card: {
    minHeight: 185,
    borderRadius: 22,
    padding: 14,
    justifyContent: "space-between",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
    paddingRight: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.92)",
    paddingRight: 6,
  },
});

export default FriendsList;