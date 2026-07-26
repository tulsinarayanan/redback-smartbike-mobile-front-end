import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CustomSafeArea from "@/components/CustomSafeArea";
import { AuthContext } from "@/context/authContext";
import { initialFriends } from "../../../friendsdata/data";
import {
  fetchFriendRequests,
  fetchFriends,
  fetchNotifications,
  respondToFriendRequest,
  searchUsers,
  sendFriendRequest,
} from "@/features/friends/data";

const getStatusStyle = (status) => {
  switch (status) {
    case "Online":
      return { bg: "bg-[#1E2A24]", text: "text-[#4ADE80]" };
    case "Active":
      return { bg: "bg-[#2B241C]", text: "text-[#FBBF24]" };
    default:
      return { bg: "bg-[#1D2432]", text: "text-[#AAB2C0]" };
  }
};

const getFriendshipLabel = (status) => {
  if (status === "accepted") return "Friends";
  if (status === "pending_sent") return "Pending";
  if (status === "blocked") return "Blocked";

  return "Add Friend";
};

const FriendCard = ({ item }) => {
  const statusStyle = getStatusStyle(item.status);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/friendsdetails/${item.id}`)}
      className="w-[48.5%] bg-[#141A26] rounded-3xl p-4 border border-[#1F2937]"
    >
      <View className="items-center">
        <Image source={{ uri: item.photo }} className="w-20 h-20 rounded-full mb-3" />
        <Text className="text-white text-base font-semibold text-center">
          {item.name}
        </Text>
        <Text className="text-[#9CA3AF] text-xs mt-1 text-center">
          {item.email}
        </Text>
        <View className={`mt-3 px-3 py-1 rounded-full ${statusStyle.bg}`}>
          <Text className={`text-[10px] font-semibold ${statusStyle.text}`}>
            {item.status}
          </Text>
        </View>
        <View className="mt-4 w-full bg-[#1D2432] rounded-2xl p-3 items-center">
          <Text className="text-[#9CA3AF] text-xs">Total Rides</Text>
          <Text className="text-white text-lg font-bold mt-1">{item.rides}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const UserResultCard = ({ item, onAddFriend, onRespond }) => {
  const status = item.friendship_status || "none";
  const isAccepted = status === "accepted";
  const isPendingSent = status === "pending_sent";
  const isPendingReceived = status === "pending_received";
  const isBlocked = status === "blocked";
  const disabled = isAccepted || isPendingSent || isBlocked;

  return (
    <View className="w-[48.5%] bg-[#141A26] rounded-3xl p-4 border border-[#1F2937]">
      <View className="items-center">
        <Image source={{ uri: item.photo }} className="w-20 h-20 rounded-full mb-3" />
        <Text className="text-white text-base font-semibold text-center">
          {item.name}
        </Text>
        <Text className="text-[#9CA3AF] text-xs mt-1 text-center">
          {item.email}
        </Text>

        {isPendingReceived ? (
          <View className="flex-row flex-wrap gap-2 mt-4 justify-center">
            <TouchableOpacity
              onPress={() => onRespond(item, "accept")}
              className="bg-[#22C55E] rounded-2xl px-3 py-2"
            >
              <Text className="text-white text-xs font-bold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onRespond(item, "reject")}
              className="bg-[#1D2432] rounded-2xl px-3 py-2"
            >
              <Text className="text-white text-xs font-bold">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onRespond(item, "block")}
              className="bg-[#7F1D1D] rounded-2xl px-3 py-2"
            >
              <Text className="text-white text-xs font-bold">Block</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            disabled={disabled}
            onPress={() => onAddFriend(item)}
            className={`mt-4 w-full rounded-2xl p-3 items-center ${
              disabled ? "bg-[#1D2432]" : "bg-[#FF7A59]"
            }`}
          >
            <Text className="text-white text-xs font-bold">
              {getFriendshipLabel(status)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const IncomingRequest = ({ request, onRespond }) => (
  <View className="bg-[#141A26] rounded-2xl p-3 border border-[#1F2937] mb-3">
    <Text className="text-white font-semibold">
      {request.requester?.name || "Rider"}
    </Text>
    <Text className="text-[#9CA3AF] text-xs mt-1">
      wants to connect with you
    </Text>
    <View className="flex-row flex-wrap gap-2 mt-3">
      <TouchableOpacity
        onPress={() => onRespond(request, "accept")}
        className="bg-[#22C55E] rounded-xl px-3 py-2"
      >
        <Text className="text-white text-xs font-bold">Accept</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onRespond(request, "reject")}
        className="bg-[#1D2432] rounded-xl px-3 py-2"
      >
        <Text className="text-white text-xs font-bold">Reject</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onRespond(request, "block")}
        className="bg-[#7F1D1D] rounded-xl px-3 py-2"
      >
        <Text className="text-white text-xs font-bold">Block</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const getNotificationIcon = (type) => {
  if (type === "message") return "message";
  if (type === "friend_request") return "person-add";
  if (type === "achievement") return "star";

  return "notifications";
};

const NotificationCard = ({ notification }) => {
  const canOpenChat = notification.type === "message" && notification.related_id;

  return (
    <TouchableOpacity
      activeOpacity={canOpenChat ? 0.85 : 1}
      disabled={!canOpenChat}
      onPress={() => {
        if (canOpenChat) {
          router.push({
            pathname: "/chat/[id]",
            params: {
              id: notification.related_id,
              mode: "conversation",
            },
          });
        }
      }}
      className="bg-[#141A26] rounded-2xl p-3 border border-[#1F2937] mb-3"
    >
      <View className="flex-row items-start">
        <View className="w-9 h-9 rounded-xl bg-[#1D2432] items-center justify-center mr-3">
          <MaterialIcons
            name={getNotificationIcon(notification.type)}
            size={18}
            color="#FF7A59"
          />
        </View>
        <View className="flex-1">
          <Text className="text-white font-semibold">
            {notification.title || "Notification"}
          </Text>
          <Text className="text-[#9CA3AF] text-xs mt-1">
            {notification.body ||
              notification.message ||
              "You have a new update."}
          </Text>
          {canOpenChat ? (
            <Text className="text-[#FF7A59] text-xs font-semibold mt-2">
              Open chat
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SectionCard = ({ title, subtitle, children }) => (
  <View className="bg-[#101722] rounded-3xl p-4 border border-[#1F2937] mb-4">
    <View className="mb-3">
      <Text className="text-white text-lg font-semibold">{title}</Text>
      {subtitle ? (
        <Text className="text-[#9CA3AF] text-sm mt-1">{subtitle}</Text>
      ) : null}
    </View>
    {children}
  </View>
);

const EmptyState = ({ text }) => (
  <View className="bg-[#141A26] rounded-2xl p-5 border border-[#1F2937]">
    <Text className="text-white text-base font-semibold text-center">
      {text}
    </Text>
  </View>
);

const FriendsList = () => {
  const { user, signOut } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [usingMockFallback, setUsingMockFallback] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const isSearchingUsers = search.trim().length >= 2;

  const loadFriends = useCallback(async () => {
    if (!user?.id) {
      setFriends([]);
      setUsingMockFallback(false);
      setIsLoadingFriends(false);
      return;
    }

    setIsLoadingFriends(true);
    try {
      const apiFriends = await fetchFriends(user.id);
      setFriends(apiFriends);
      setUsingMockFallback(false);
    } finally {
      setIsLoadingFriends(false);
    }
  }, [user?.id]);

  const loadRequests = useCallback(async () => {
    if (!user?.id) {
      setIncomingRequests([]);
      setIsLoadingRequests(false);
      return;
    }

    setIsLoadingRequests(true);
    try {
      const requests = await fetchFriendRequests(user.id);
      setIncomingRequests(requests);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [user?.id]);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setIsLoadingNotifications(false);
      return;
    }

    setIsLoadingNotifications(true);
    try {
      const items = await fetchNotifications(user.id);
      setNotifications(items);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [user?.id]);

  const loadSearchResults = useCallback(async () => {
    const query = search.trim();

    if (query.length < 2 || !user?.id) {
      setSearchResults([]);
      return;
    }

    setIsLoadingSearch(true);
    try {
      const results = await searchUsers(query, user.id);
      setSearchResults(results);
      setSearchAttempted(true);
    } finally {
      setIsLoadingSearch(false);
    }
  }, [search, user?.id]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      loadFriends(),
      loadRequests(),
      loadNotifications(),
      loadSearchResults(),
    ]);
  }, [loadFriends, loadRequests, loadNotifications, loadSearchResults]);

  useEffect(() => {
    let isMounted = true;

    loadFriends().catch((error) => {
      console.warn("Friends API unavailable. Using mock data.", error);

      if (isMounted) {
        setFriends(initialFriends);
        setUsingMockFallback(true);
        setIsLoadingFriends(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadFriends, user?.id]);

  useEffect(() => {
    loadRequests().catch((error) => {
      console.warn("Friend requests unavailable.", error);
      setIncomingRequests([]);
      setIsLoadingRequests(false);
    });
    loadNotifications().catch((error) => {
      console.warn("Notifications unavailable.", error);
      setNotifications([]);
      setIsLoadingNotifications(false);
    });
  }, [loadNotifications, loadRequests, user?.id]);

  useEffect(() => {
    const query = search.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setSearchAttempted(false);
      return;
    }

    const timeout = setTimeout(() => {
      loadSearchResults().catch((error) => {
        console.warn("User search unavailable.", error);
        setSearchResults([]);
        setSearchAttempted(true);
        setIsLoadingSearch(false);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [loadSearchResults, search, user?.id]);

  const handleAddFriend = async (item) => {
    if (!user?.id) {
      Alert.alert("Sign in required", "Please sign in before adding friends.");
      return;
    }

    try {
      await sendFriendRequest(user.id, item.id);
      await refreshAll();
    } catch (error) {
      console.warn("Friend request failed.", error);
      Alert.alert("Add friend failed", error?.message || "Please try again.");
    }
  };

  const handleRespond = async (request, action) => {
    try {
      await respondToFriendRequest(request.friendship_id, action);
      await refreshAll();
    } catch (error) {
      console.warn("Friend request response failed.", error);
      Alert.alert("Request failed", error?.message || "Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();

      if (error) {
        Alert.alert("Logout failed", error.message);
        return;
      }

      router.replace("/");
    } catch (error) {
      console.warn("Logout failed:", error);
      Alert.alert("Logout failed", "Something went wrong while logging out.");
    }
  };

  return (
    <CustomSafeArea bgColour="#0B0F1A">
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-[#C2C8D0] text-base">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text className="text-[#FF7A59] text-base font-semibold">
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-[#141A26] rounded-[28px] p-5 mb-5 border border-[#1F2937]">
          <View className="w-16 h-16 rounded-full bg-[#221A22] items-center justify-center mb-4">
            <FontAwesome5 name="user-friends" size={28} color="#FF7A59" />
          </View>
          <Text className="text-white text-3xl font-bold">Friends</Text>
          <Text className="text-[#AAB2C0] text-sm mt-2 leading-5">
            Keep track of your riding friends, view their activity and connect
            with your cycling community.
          </Text>

          <View className="flex-row gap-3 mt-5">
            <View className="flex-1 bg-[#1D2432] rounded-2xl p-3">
              <Text className="text-[#9CA3AF] text-xs">Total Friends</Text>
              <Text className="text-white text-xl font-bold mt-1">
                {usingMockFallback ? `${friends.length} mock` : friends.length}
              </Text>
            </View>
            <View className="flex-1 bg-[#1D2432] rounded-2xl p-3">
              <Text className="text-[#9CA3AF] text-xs">Requests</Text>
              <Text className="text-white text-xl font-bold mt-1">
                {incomingRequests.length}
              </Text>
            </View>
            <View className="flex-1 bg-[#1D2432] rounded-2xl p-3">
              <Text className="text-[#9CA3AF] text-xs">Notices</Text>
              <Text className="text-white text-xl font-bold mt-1">
                {notifications.length}
              </Text>
            </View>
          </View>
        </View>

        <SectionCard
          title="Search Users"
          subtitle="Search by name, username, or email to add friends"
        >
          <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center bg-[#141A26] rounded-2xl px-4 py-3 border border-[#1F2937]">
              <AntDesign name="search1" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Search users"
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
                className="ml-3 flex-1 text-white"
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={loadSearchResults}
              className="bg-[#FF7A59] px-4 rounded-2xl items-center justify-center min-w-[56px]"
            >
              <MaterialIcons name="person-add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {isSearchingUsers ? (
            <View className="mt-4">
              {isLoadingSearch ? (
                <ActivityIndicator size="small" color="#FF7A59" />
              ) : searchResults.length > 0 ? (
                <View className="flex-row flex-wrap justify-between gap-y-4">
                  {searchResults.map((item) => (
                    <UserResultCard
                      key={item.id}
                      item={item}
                      onAddFriend={handleAddFriend}
                      onRespond={handleRespond}
                    />
                  ))}
                </View>
              ) : searchAttempted ? (
                <EmptyState text="No users found" />
              ) : (
                <Text className="text-[#9CA3AF] text-sm">
                  Type at least 2 characters to search.
                </Text>
              )}
            </View>
          ) : null}
        </SectionCard>

        <SectionCard title="Friend Requests" subtitle="Review incoming requests">
          {isLoadingRequests ? (
            <ActivityIndicator size="small" color="#FF7A59" />
          ) : incomingRequests.length > 0 ? (
            incomingRequests.map((request) => (
              <IncomingRequest
                key={request.friendship_id}
                request={request}
                onRespond={handleRespond}
              />
            ))
          ) : (
            <EmptyState text="No incoming requests." />
          )}
        </SectionCard>

        <SectionCard
          title="Notifications"
          subtitle="Friend requests, messages, and ride progress"
        >
          {isLoadingNotifications ? (
            <ActivityIndicator size="small" color="#FF7A59" />
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <EmptyState text="No notifications yet." />
          )}
        </SectionCard>

        <SectionCard
          title="My Friends"
          subtitle={
            usingMockFallback
              ? "Showing mock friends because the backend is unavailable"
              : "Friends accepted through requests"
          }
        >
          {isLoadingFriends ? (
            <ActivityIndicator size="small" color="#FF7A59" />
          ) : friends.length > 0 ? (
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {friends.map((item) => (
                <FriendCard key={item.id} item={item} />
              ))}
            </View>
          ) : (
            <EmptyState text="No friends yet. Search users to add friends." />
          )}
        </SectionCard>
      </ScrollView>
    </CustomSafeArea>
  );
};

export default FriendsList;
