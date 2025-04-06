import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import { Search } from "lucide-react-native"; // Assuming you have a compatible icon library
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig"; // Adjust the import path as needed
import { ChatUser } from "@/types/chat"; // Adjust the import path as needed
import { ref, onValue } from "firebase/database";
import { getDatabase } from "firebase/database";
import moment from "moment";
import { fetchAllChatsForSidebar, formatTimeForChatList } from "@/utils/ChatHelper";
import { Image } from "expo-image";
import {useRouter} from "expo-router"; // Use expo-image for better performance

export default function ChatsPage() {
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [userStatuses, setUserStatuses] = useState<{ [key: string]: { state: string; lastChanged: number } }>({});
  const router = useRouter();

  // Fetch user statuses from Realtime Database
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const statuses = Object.keys(data).reduce((acc, userId) => {
          acc[userId] = {
            state: data[userId]?.status?.state || "offline",
            lastChanged: data[userId]?.status?.lastChanged || 0,
          };
          return acc;
        }, {} as { [key: string]: { state: string; lastChanged: number } });

        setUserStatuses(statuses);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle authentication state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to login if no user is authenticated
        // You can use React Navigation for navigation in React Native
        console.warn("No User - Redirecting to Login");
        return;
      }

      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch chats for the current user
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeChats = fetchAllChatsForSidebar(setChats);

    return () => {
      if (unsubscribeChats) {
        unsubscribeChats();
      }
    };
  }, [currentUser]);

  // Calculate total unread messages
  useEffect(() => {
    const totalUnreads = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
    setTotalUnreadCount(totalUnreads);
  }, [chats]);

  // Filter chats based on search term
  const filteredChats = chats.filter((chat) =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
    );
  }

  return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Messages</Text>
          {totalUnreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{totalUnreadCount}</Text>
              </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
              style={styles.searchInput}
              placeholder="Search messages..."
              placeholderTextColor="#666"
              value={searchTerm}
              onChangeText={setSearchTerm}
          />
        </View>

        {/* Chat List */}
        <ScrollView style={styles.chatList}>
          {filteredChats.map((chat) => {
            const userStatus = userStatuses[chat.id];
            const isOnline = userStatus?.state === "online";
            const lastSeen = userStatus?.lastChanged
                ? moment(userStatus.lastChanged).fromNow()
                : "Unavailable";

            return (
                <TouchableOpacity
                    key={chat.id}
                    style={styles.chatItem}
                    onPress={() => {
                      // Navigate to chat screen using React Navigation
                      console.log("Navigate to chat:", chat.id);
                      router.push(`/messages/${chat.id}`)
                    }}
                >
                  {/* Profile Picture */}
                  <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: chat.avatar }}
                        style={styles.avatar}
                    />
                    {isOnline && <View style={styles.onlineIndicator} />}
                  </View>

                  {/* Chat Info */}
                  <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                      <Text style={styles.chatName}>{chat.name}</Text>
                      <Text style={styles.chatTime}>
                        {formatTimeForChatList(chat.lastMessageTime || Date.now())}
                      </Text>
                    </View>
                    <Text style={styles.lastMessage}>{chat.lastMessage}</Text>
                    {!isOnline && (
                        <Text style={styles.lastSeen}>Last seen {lastSeen}</Text>
                    )}
                  </View>

                  {/* Unread Messages Badge */}
                  {chat.unreadCount > 0 && (
                      <View style={styles.unreadChatBadge}>
                        <Text style={styles.unreadChatText}>{chat.unreadCount}</Text>
                      </View>
                  )}
                </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
  },
  unreadBadge: {
    backgroundColor: "#fe3e00",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 10,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00ff00",
    borderWidth: 2,
    borderColor: "#000",
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  chatTime: {
    fontSize: 12,
    color: "#666",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  lastSeen: {
    fontSize: 12,
    color: "#666",
  },
  unreadChatBadge: {
    backgroundColor: "#fe3e00",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unreadChatText: {
    color: "#fff",
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
