import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CustomSafeArea from "@/components/CustomSafeArea";
import { chatContacts } from "../../../friendsdata/chatData";

const chatGradients = [
  ["#F4D2D2", "#FF4D4D"],
  ["#D8D4FF", "#5E5CE6"],
  ["#F6D3A8", "#FF9800"],
  ["#F8CAE0", "#F45BB4"],
  ["#D8CFF6", "#7C70F4"],
  ["#CFE0FF", "#2F80FF"],
];

export default function ChatListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredContacts = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return chatContacts;

    return chatContacts.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.lastMessage.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <CustomSafeArea bgColour="#F3F3F3">
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Messages</Text>
          <TouchableOpacity style={styles.headerIconButton}>
            <MaterialIcons name="chat" size={28} color="#111" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#7B7B7B" />
          <TextInput
            placeholder="Search messages"
            placeholderTextColor="#8A8A8A"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const colors = chatGradients[index % chatGradients.length];

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
                  <View style={styles.cardTopRow}>
                    <Image source={{ uri: item.photo }} style={styles.avatar} />

                    {item.unread > 0 ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.cardBottomRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.cardSubtitle} numberOfLines={2}>
                        {item.lastMessage}
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
}

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
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  unreadBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    color: "#fff",
    fontWeight: "800",
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
    lineHeight: 17,
    color: "rgba(255,255,255,0.92)",
    paddingRight: 6,
  },
});