import { chatContacts } from "../../../friendsdata/chatData";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK_PHOTO = "https://i.pravatar.cc/150?img=14";
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value) => UUID_REGEX.test(String(value || ""));

const buildUrl = (path, params = {}) => {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not set");
  }

  const url = new URL(path, API_BASE_URL);
  url.search = new URLSearchParams(params).toString();

  return url.toString();
};

const formatTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const normalizeConversations = (rows) => {
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => {
    const other = row?.otherParticipant || {};

    return {
      id: row?.id || `conversation-${index}`,
      conversationId: row?.id || `conversation-${index}`,
      profileId: other?.id || "",
      name: other?.name || other?.username || "Rider",
      photo: other?.photo || other?.avatar_url || FALLBACK_PHOTO,
      status: "Active",
      lastSeen: row?.updatedAt ? `last message ${formatTime(row.updatedAt)}` : "",
      time: formatTime(row?.updatedAt),
      unread: Number(row?.unread) || 0,
      lastMessage: row?.lastMessage?.body || "No messages yet",
      messages: [],
      isBackendConversation: true,
    };
  });
};

export const normalizeMessages = (rows, currentUserId) => {
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => ({
    id: row?.id || `message-${index}`,
    conversation_id: row?.conversation_id,
    sender_id: row?.sender_id,
    sender: row?.sender_id === currentUserId ? "me" : "them",
    text: row?.body || "",
    body: row?.body || "",
    time: formatTime(row?.created_at) || "Now",
    created_at: row?.created_at,
  }));
};

export const fetchConversations = async (userId) => {
  if (!userId) return [];

  try {
    const url = buildUrl("/api/chat/conversations", { user_id: userId });
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Chat conversations API returned ${response.status}`);
      throw new Error("Chat conversations request failed");
    }

    return normalizeConversations(await response.json());
  } catch (error) {
    console.warn("Chat conversations unavailable. Using mock data.", error);
    throw error;
  }
};

export const createConversation = async (userIds) => {
  const response = await fetch(buildUrl("/api/chat/conversations"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_ids: userIds }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to create conversation");
  }

  return data;
};

export const fetchMessages = async (conversationId, currentUserId) => {
  if (!conversationId) return [];

  const response = await fetch(
    buildUrl(`/api/chat/conversations/${conversationId}/messages`),
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch messages");
  }

  return normalizeMessages(data, currentUserId);
};

export const sendChatMessage = async ({ conversationId, senderId, body }) => {
  const response = await fetch(buildUrl("/api/chat/messages"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      sender_id: senderId,
      body,
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to send message");
  }

  return normalizeMessages([data], senderId)[0];
};

export const getMockContactById = (id) =>
  chatContacts.find((contact) => String(contact.id) === String(id));
