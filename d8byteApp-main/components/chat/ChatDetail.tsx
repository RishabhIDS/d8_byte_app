import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, Send, Bot, Loader2, Menu, X, ChevronLeft, Phone, Video, MoreVertical } from "lucide-react-native"; // Use compatible icons
import { useChat } from "@/hooks/useChat"; // Adjust the import path as needed
import { formatTimeForChatList, formatMessageTimestamp, formatMessageDate, groupMessagesByDate, fetchUserDetails, fetchAllChatsForSidebar, generateChatId } from "@/utils/ChatHelper"; // Adjust the import path as needed
import { auth, db, firestore } from "@/firebase/firebaseConfig"; // Adjust the import path as needed
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, getDatabase } from "firebase/database";
import moment from "moment";
import {ChatUser} from "@/types/chat";

interface ChatDetailProps {
    userId: string;
}

const ChatDetailLoader = () => {
    return (
        <View style={styles.loaderContainer}>
            <View style={styles.loaderAnimation}>
                <View style={styles.loaderCircle} />
                <View style={[styles.loaderCircle, styles.loaderCircleDelay1]} />
                <View style={[styles.loaderCircle, styles.loaderCircleDelay2]} />
            </View>
            <Text style={styles.loaderText}>Loading your conversation...</Text>
        </View>
    );
};

export default function ChatDetail({ userId }: ChatDetailProps) {
    const navigation = useNavigation();
    const route = useRoute();
    const { messages, sendMessage, markMessagesSeen, handleInputChange } = useChat(userId);
    const [messageInput, setMessageInput] = useState("");
    const [chatUser, setChatUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chats, setChats] = useState<ChatUser[]>([]);
    const messagesEndRef = useRef<ScrollView>(null);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState<boolean>(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currUserUid, setUserId] = useState<string | null>(null);
    const [userStatus, setUserStatus] = useState<{ state: string; lastChanged: number } | null>(null);
    const [canChat, setCanChat] = useState<boolean>(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await fetchProfilePic(user.uid);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchProfilePic = async (userId: string) => {
        try {
            const userDocRef = doc(db, "users", userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserId(userData.uid);
            }
        } catch (error) {
            console.error("Error fetching profile picture:", error);
        }
    };

    useEffect(() => {
        if (!userId || !currUserUid) return;

        const chatId = generateChatId(currUserUid, userId);
        const likesRef = doc(firestore, "likes", chatId);

        const unsubscribe = onSnapshot(likesRef, (docSnap) => {
            if (docSnap.exists()) {
                const likesData = docSnap.data();
                const user1Liked = likesData[currUserUid] === true;
                const user2Liked = likesData[userId] === true;

                setCanChat(user1Liked && user2Liked);
            } else {
                setCanChat(false);
            }
        });

        return () => unsubscribe();
    }, [userId, currUserUid]);

    useEffect(() => {
        if (!userId || !currUserUid) return;

        const userDocRef = doc(firestore, "users", userId);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (!docSnap.exists()) {
                setIsOtherUserTyping(false);
                return;
            }

            const userData = docSnap.data();
            const chatId = generateChatId(currUserUid, userId);
            const typingStatus = userData?.typing?.[chatId] || false;
            setIsOtherUserTyping(typingStatus);
        });

        return () => unsubscribe();
    }, [userId, currUserUid]);

    useEffect(() => {
        const db = getDatabase();
        const userStatusRef = ref(db, `users/${userId}/status`);

        const unsubscribe = onValue(userStatusRef, (snapshot) => {
            if (snapshot.exists()) {
                const status = snapshot.val();
                setUserStatus(status);
            } else {
                setUserStatus(null);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        const getUserDetails = async () => {
            try {
                setIsLoading(true);
                const user = await fetchUserDetails(userId);
                setChatUser(user);
            } catch (error) {
                console.error("Error fetching user details:", error);
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        getUserDetails();
    }, [userId]);

    useEffect(() => {
        const unsubscribe = fetchAllChatsForSidebar(setChats);
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [userId, currUserUid]);

    useEffect(() => {
        markMessagesSeen();
        messagesEndRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        sendMessage(messageInput);
        setMessageInput("");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (isLoading) {
        return <ChatDetailLoader />;
    }

    const messageGroups = groupMessagesByDate(messages);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Image source={{ uri: chatUser?.photos?.[0] }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{chatUser?.name}</Text>
                    <Text style={styles.userStatus}>
                        {isOtherUserTyping ? "Typing..." : userStatus?.state === "online" ? "Online" : `Last seen ${moment(userStatus?.lastChanged).fromNow()}`}
                    </Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity>
                        <Phone size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Video size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <MoreVertical size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chat Messages */}
            <ScrollView
                ref={messagesEndRef}
                contentContainerStyle={styles.messagesContainer}
            >
                {messageGroups.map((group) => (
                    <View key={group.date} style={styles.messageGroup}>
                        <Text style={styles.dateLabel}>{formatMessageDate(group.timestamp)}</Text>
                        {group.messages.map((msg, index) => {
                            const isCurrentUser = msg.senderId === auth.currentUser?.uid;
                            const showAvatar = index === 0 || group.messages[index - 1]?.senderId !== msg.senderId;

                            return (
                                <View
                                    key={msg.id}
                                    style={[
                                        styles.messageBubble,
                                        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
                                    ]}
                                >
                                    {!isCurrentUser && showAvatar && (
                                        <Image source={{ uri: chatUser?.photos?.[0] }} style={styles.messageAvatar} />
                                    )}
                                    <Text style={styles.messageText}>{msg.text}</Text>
                                    <Text style={styles.messageTime}>
                                        {formatMessageTimestamp(msg.timestamp)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>

            {/* Message Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#666"
                    value={messageInput}
                    onChangeText={(text) => {
                        setMessageInput(text);
                        handleInputChange(text);
                    }}
                />
                <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                    <Send size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    userStatus: {
        fontSize: 12,
        color: "#666",
    },
    headerIcons: {
        flexDirection: "row",
        gap: 16,
    },
    messagesContainer: {
        padding: 16,
    },
    messageGroup: {
        marginBottom: 16,
    },
    dateLabel: {
        textAlign: "center",
        color: "#666",
        marginBottom: 8,
    },
    messageBubble: {
        maxWidth: "75%",
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    currentUserBubble: {
        alignSelf: "flex-end",
        backgroundColor: "#fe3e00",
    },
    otherUserBubble: {
        alignSelf: "flex-start",
        backgroundColor: "#333",
    },
    messageText: {
        color: "#fff",
    },
    messageTime: {
        fontSize: 10,
        color: "#999",
        textAlign: "right",
    },
    messageAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#333",
    },
    input: {
        flex: 1,
        backgroundColor: "#333",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: "#fff",
    },
    sendButton: {
        marginLeft: 16,
        backgroundColor: "#fe3e00",
        borderRadius: 24,
        padding: 12,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    loaderAnimation: {
        position: "relative",
        width: 64,
        height: 64,
    },
    loaderCircle: {
        position: "absolute",
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: "#fe3e00",
        borderTopColor: "transparent",
        animationKeyframes: {
            "0%": { transform: [{ rotate: "0deg" }] },
            "100%": { transform: [{ rotate: "360deg" }] },
        },
        animationDuration: "1s",
        animationIterationCount: "infinite",
    },
    loaderCircleDelay1: {
        animationDelay: "0.15s",
    },
    loaderCircleDelay2: {
        animationDelay: "0.3s",
    },
    loaderText: {
        marginTop: 16,
        color: "#666",
    },
});
