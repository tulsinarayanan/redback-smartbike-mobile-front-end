import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import CustomSafeArea from "@/components/CustomSafeArea";
import { useAuth } from "@/context/authContext";
import { callHealthyBot } from "@/features/healthyBot/api";

const SUGGESTIONS = [
  "How was my last ride?",
  "What are my HR zones today?",
  "Should I do recovery or intervals tomorrow?",
];

const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Simple markdown renderer for bot bubbles: bold, lists, headers, line breaks
const MarkdownText = ({ text, textStyle }) => {
  if (!text) return null;
  const lines = String(text).split("\n");
  return (
    <View>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <View key={lineIdx} style={{ height: 6 }} />;

        // Headings: # , ## , ###
        if (trimmed.startsWith("# ")) {
          return (
            <Text key={lineIdx} style={[textStyle, styles.mdH1]}>
              {trimmed.replace(/^#\s+/, "")}
            </Text>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <Text key={lineIdx} style={[textStyle, styles.mdH2]}>
              {trimmed.replace(/^##\s+/, "")}
            </Text>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <Text key={lineIdx} style={[textStyle, styles.mdH3]}>
              {trimmed.replace(/^###\s+/, "")}
            </Text>
          );
        }
        // Bullet list: - , • , * or numbered
        if (/^[-•*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
          const bulletContent = trimmed.replace(/^[-•*]\s/, "").replace(/^\d+\.\s/, "");
          return (
            <View key={lineIdx} style={styles.bulletRow}>
              <Text style={[textStyle, styles.bulletChar]}>• </Text>
              <Text style={[textStyle, { flex: 1 }]}>{renderBoldSegments(bulletContent, textStyle)}</Text>
            </View>
          );
        }
        // Horizontal rule
        if (trimmed === "---") {
          return <View key={lineIdx} style={styles.hr} />;
        }
        // Blockquote >
        if (trimmed.startsWith("> ")) {
          return (
            <View key={lineIdx} style={styles.blockquote}>
              <Text style={[textStyle, styles.blockquoteText]}>{renderBoldSegments(trimmed.replace(/^>\s/, ""), textStyle)}</Text>
            </View>
          );
        }
        // Regular paragraph with bold parsing
        return (
          <Text key={lineIdx} style={[textStyle, { marginBottom: 4 }]}>
            {renderBoldSegments(line, textStyle)}
          </Text>
        );
      })}
    </View>
  );
};

const renderBoldSegments = (text, baseStyle) => {
  const parts = String(text).split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      return (
        <Text key={idx} style={[baseStyle, { fontWeight: "800" }]}>
          {inner}
        </Text>
      );
    }
    // Also handle *italic* or __?
    return (
      <Text key={idx} style={baseStyle}>
        {part}
      </Text>
    );
  });
};

export default function HealthyBotScreen() {
  const { user } = useAuth();
  const userId = user?.id || "b2100241-92ed-483a-98bf-d721bb325700"; // fallback test UUID for dev
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "bot",
      text: "Hi, I'm **Healthy Bot — Your SmartBike AI Health & Performance Coach**! 👋\n\nI have your latest ride, HR zones, and 7-day load ready. Ask me about your training, recovery, or next workout.",
      timestamp: formatTime(new Date()),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [metricsPill, setMetricsPill] = useState("Active • Ready");

  useEffect(() => {
    // Auto-scroll on new messages
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async (textOverride) => {
    const message = (textOverride ?? inputText).trim();
    if (!message || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: message,
      timestamp: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const data = await callHealthyBot({ user_id: userId, message });
      const reply = data?.reply || "I could not generate a response. Please try again.";
      const context = data?.context_used;

      // Update metrics pill from context
      if (context?.latest_ride?.ride_id) {
        const dateStr = context.latest_ride.start_time
          ? new Date(context.latest_ride.start_time).toLocaleDateString()
          : null;
        if (dateStr) setMetricsPill(`Last ride ${dateStr}`);
      } else if (context?.seven_day_summary?.ride_count != null) {
        setMetricsPill(`${context.seven_day_summary.ride_count} rides • 7d`);
      }

      const botMsg = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: reply,
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const botMsg = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: `⚠️ I could not reach the coach service: ${err.message}\n\nPlease check your connection (API at \`${process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001"}\`) and try again.`,
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.bubbleRow, isUser ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <MaterialCommunityIcons name="robot" size={16} color="#fff" />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          {isUser ? (
            <Text style={styles.userText}>{item.text}</Text>
          ) : (
            <MarkdownText text={item.text} textStyle={styles.botText} />
          )}
          <Text style={[styles.timeText, isUser ? styles.timeTextUser : styles.timeTextBot]}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <CustomSafeArea bgColour="black" applyTopInset={true}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrap}>
              <MaterialCommunityIcons name="robot-outline" size={22} color="#EB7363" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Healthy Bot</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online • AI Health Coach</Text>
              </View>
            </View>
          </View>
          <View style={styles.metricsPill}>
            <Text style={styles.metricsPillText} numberOfLines={1}>
              {metricsPill}
            </Text>
          </View>
        </View>

        {/* Message History */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Quick Suggestion Chips */}
        <View style={styles.chipsWrap}>
          <FlatList
            data={SUGGESTIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.chipsContent}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.chip} activeOpacity={0.8} onPress={() => sendMessage(item)}>
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask Healthy Bot about your training..."
              placeholderTextColor="#6B7280"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            activeOpacity={0.85}
            onPress={() => sendMessage()}
            disabled={loading || !inputText.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </CustomSafeArea>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "black",
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  onlineText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
  },
  metricsPill: {
    backgroundColor: "#15171C",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    maxWidth: 130,
  },
  metricsPillText: {
    color: "#EB7363",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  bubbleRowRight: {
    justifyContent: "flex-end",
  },
  bubbleRowLeft: {
    justifyContent: "flex-start",
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EB7363",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: "#EB7363",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#15171C",
    borderWidth: 1,
    borderColor: "#23252B",
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: "#fff",
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: "500",
  },
  botText: {
    color: "#E5E7EB",
    fontSize: 13.5,
    lineHeight: 19,
  },
  timeText: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: "500",
  },
  timeTextUser: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  timeTextBot: {
    color: "#6B7280",
    textAlign: "left",
  },
  mdH1: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    marginTop: 4,
  },
  mdH2: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
    marginTop: 6,
  },
  mdH3: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E5E7EB",
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
    paddingRight: 4,
  },
  bulletChar: {
    color: "#EB7363",
    fontWeight: "700",
    marginRight: 2,
  },
  hr: {
    height: 1,
    backgroundColor: "#23252B",
    marginVertical: 8,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#EB7363",
    paddingLeft: 8,
    marginVertical: 4,
    backgroundColor: "#1F1F23",
    paddingVertical: 4,
    borderRadius: 4,
  },
  blockquoteText: {
    color: "#D1D5DB",
    fontStyle: "italic",
    fontSize: 13,
  },
  chipsWrap: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#0F0F0F",
    backgroundColor: "black",
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    color: "#D1D5DB",
    fontSize: 12.5,
    fontWeight: "600",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "black",
    borderTopWidth: 1,
    borderTopColor: "#1F1F1F",
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#15171C",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#23252B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  textInput: {
    color: "#fff",
    fontSize: 14,
    maxHeight: 90,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EB7363",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
