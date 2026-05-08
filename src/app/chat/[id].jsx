import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CustomSafeArea from "@/components/CustomSafeArea";
import { getChatContactById } from "../../../friendsdata/chatData";

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const contact = useMemo(() => getChatContactById(id), [id]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(contact?.messages || []);
  const listRef = useRef(null);

  if (!contact) {
    return (
      <CustomSafeArea bgColour="#F3F3F3">
        <View style={[styles.container, styles.centered]}>
          <Text>Chat not found.</Text>
        </View>
      </CustomSafeArea>
    );
  }

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMessage = {
      id: `${contact.id}-${Date.now()}`,
      sender: "me",
      text: trimmed,
      time: "Now",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <CustomSafeArea bgColour="#F3F3F3">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.topIconButton}
          >
            <Ionicons name="chevron-back" size={26} color="#111" />
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Chat</Text>

          <TouchableOpacity style={styles.topIconButton}>
            <Feather name="more-horizontal" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={["#D8D4FF", "#5E5CE6"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.profileCard}
        >
          <Image source={{ uri: contact.photo }} style={styles.headerAvatar} />

          <View style={{ flex: 1 }}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactStatus}>{contact.status}</Text>
          </View>

          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="phone" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="video" size={18} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.messagesWrap}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messageListContent}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item }) => {
              const isMe = item.sender === "me";

              return (
                <View
                  style={[
                    styles.messageRow,
                    isMe ? styles.messageRowMe : styles.messageRowThem,
                  ]}
                >
                  {!isMe && (
                    <Image
                      source={{ uri: contact.photo }}
                      style={styles.bubbleAvatar}
                    />
                  )}

                  <View
                    style={
                      isMe
                        ? styles.myBubbleContainer
                        : styles.theirBubbleContainer
                    }
                  >
                    {isMe ? (
                      <LinearGradient
                        colors={["#D7D0FF", "#6A5AE0"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.myBubble}
                      >
                        <Text style={styles.myBubbleText}>{item.text}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.theirBubble}>
                        <Text style={styles.theirBubbleText}>{item.text}</Text>
                      </View>
                    )}

                    <Text
                      style={[
                        styles.timeText,
                        isMe ? styles.timeTextMe : styles.timeTextThem,
                      ]}
                    >
                      {item.time}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputIcon}>
            <Feather name="camera" size={20} color="#6A6A6A" />
          </TouchableOpacity>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message"
            placeholderTextColor="#8B8B8B"
            style={styles.input}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="paper-plane" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </CustomSafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  topIconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#340C4C",
  },
  profileCard: {
    borderRadius: 22,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  contactName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  contactStatus: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  messagesWrap: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 10,
    marginBottom: 14,
  },
  messageListContent: {
    paddingBottom: 10,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-end",
  },
  messageRowThem: {
    justifyContent: "flex-start",
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  bubbleAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
  },
  theirBubbleContainer: {
    maxWidth: "78%",
  },
  myBubbleContainer: {
    maxWidth: "78%",
    alignSelf: "flex-end",
  },
  theirBubble: {
    backgroundColor: "#F0F0F5",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  myBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  theirBubbleText: {
    color: "#262626",
    fontSize: 15,
    lineHeight: 20,
  },
  myBubbleText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 11,
    color: "#8B8B94",
    marginTop: 5,
  },
  timeTextThem: {
    marginLeft: 4,
  },
  timeTextMe: {
    textAlign: "right",
    marginRight: 4,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 6,
  },
  inputIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#222",
    paddingHorizontal: 8,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#340C4C",
    alignItems: "center",
    justifyContent: "center",
  },
});