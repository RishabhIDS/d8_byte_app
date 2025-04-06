// Helper functions for chat optimization
// @ts-ignore

// src/utils/ChatHelper.ts
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, limit , updateDoc} from 'firebase/firestore';
import { auth, firestore } from '@/firebase/firebaseConfig';
import { ChatUser } from '@/types/chat';


export const groupMessagesByDate = (messages: any[]) => {
    if (!messages || messages.length === 0) {
        return [];
    }

    const groups: { [key: string]: any[] } = {};

    messages.forEach(message => {
        const date = new Date(message.timestamp).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
        date,
        timestamp: new Date(date).getTime(),
        messages
    }));
};

export const fetchUserDetails = async (userId: string) => {
    try {
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.log(userId);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
};

// Format date for message groups (e.g., "Today", "Yesterday", "Monday, Jan 1")
export const formatMessageDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    }
};

// Format message timestamp (e.g., "10:30 AM")
export const formatMessageTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format time for chat list (e.g., "Now", "5m", "2h", "3d")
export const formatTimeForChatList = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "Now";
    if (diff < hour) return `${Math.floor(diff / minute)}m`;
    if (diff < day) return `${Math.floor(diff / hour)}h`;
    return `${Math.floor(diff / day)}d`;
};





// Generate consistent chatId (smaller UID first)
export const generateChatId = (uid1: string, uid2: string): string => {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

// Update user online status
export const updateUserOnlineStatus = async (userId: string, isOnline: boolean) => {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, {
        online: isOnline,
        lastSeen: Date.now()
    });
};

// Update typing status
export const updateTypingStatus = async (userId: string, chatId: string, isTyping: boolean) => {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, {
        [`typing.${chatId}`]: isTyping
    });
};

// Listen for typing status changes
export const listenForTypingStatus = (otherUserId: string, chatId: string, callback: (isTyping: boolean) => void) => {
    const userRef = doc(firestore, 'users', otherUserId);

    return onSnapshot(userRef, (snapshot) => {
        const userData = snapshot.data();
        const isTyping = userData?.typing?.[chatId] || false;
        callback(isTyping);
    });
};

// Modified useChat hook

// Modified function to fetch chats for sidebar
export const fetchAllChatsForSidebarOld = (setChats: (chats: ChatUser[]) => void) => {
    if (!auth.currentUser) {
        console.warn("⚠️ No authenticated user found. Exiting fetchAllChatsForSidebar.");
        return;
    }

    const currentUserId = auth.currentUser.uid;
    console.log(`🔥 Fetching chats for user: ${currentUserId}`);

    const userChatsRef = collection(firestore, 'users', currentUserId, 'chats');
    const q = query(userChatsRef, orderBy('lastMessageTime', 'desc'));

    return onSnapshot(q, async (snapshot) => {
        console.log("📩 New snapshot received for chats.");

        if (snapshot.empty) {
            console.warn("⚠️ No chats found for the user.");
            setChats([]);
            return;
        }

        const chatsPromises = snapshot.docs.map(async (doc) => {
            const chatData = doc.data();
            const otherUserId = doc.id;
            console.log(`📨 Processing chat with: ${otherUserId}`);

            try {
                // Reference to other user's document
                // @ts-ignore
                const userDocRef = doc(firestore, 'users', otherUserId);
                console.log(`📡 Fetching user data for: ${otherUserId}`);

                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    console.warn(`🚨 User document for ${otherUserId} does not exist.`);
                    return null;
                }

                const userData = userDoc.data();
                console.log(`✅ User data retrieved for ${otherUserId}:`, userData);

                return {
                    id: otherUserId,
                // @ts-ignore
                    name: userData?.name || otherUserId,
                // @ts-ignore
                    avatar: userData?.photos?.[0] || '/images/default-avatar.png',
                    lastMessage: chatData.lastMessage,
                    lastMessageTime: chatData.lastMessageTime,
                    unreadCount: chatData.unreadCount || 0,
                // @ts-ignore
                    type: userData?.type || 'human',
                // @ts-ignore
                    online: userData?.online || false
                };
            } catch (error) {
                console.error(`❌ Error processing user ${otherUserId}:`, error);
                return null;
            }
        });

        const chats = (await Promise.all(chatsPromises)).filter(Boolean) as ChatUser[];
        console.log(`📬 Chats updated! Total chats: ${chats.length}`);
        setChats(chats);
    });
};

export const fetchAllChatsForSidebar = (setChats: (chats: ChatUser[]) => void) => {
    if (!auth.currentUser) {
        console.warn("⚠️ No authenticated user found. Exiting fetchAllChatsForSidebar.");
        return;
    }

    const currentUserId = auth.currentUser.uid;
    console.log(`🔥 Fetching chats for user: ${currentUserId}`);

    const userChatsRef = collection(firestore, 'users', currentUserId, 'chats');
    const q = query(userChatsRef, orderBy('lastMessageTime', 'desc'));

    return onSnapshot(q, async (querySnapshot) => {
        console.log("📩 New snapshot received for chats.");

        if (querySnapshot.empty) {
            console.warn("⚠️ No chats found for the user.");
            setChats([]);
            return;
        }

        const chatsPromises = querySnapshot.docs.map(async (documentSnapshot) => {
            const chatData = documentSnapshot.data();
            const otherUserId = documentSnapshot.id;
            console.log(`📨 Processing chat with: ${otherUserId}`);

            try {
                // Reference to other user's document
                const userDocRef = doc(firestore, 'users', otherUserId); // Correct usage of doc
                console.log(`📡 Fetching user data for: ${otherUserId}`);

                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    console.warn(`🚨 User document for ${otherUserId} does not exist.`);
                    return null;
                }

                const userData = userDoc.data();
                console.log(`✅ User data retrieved for ${otherUserId}:`, userData);

                return {
                    id: otherUserId,
                    name: userData?.name || otherUserId,
                    avatar: userData?.photos?.[0] || '/images/default-avatar.png',
                    lastMessage: chatData.lastMessage,
                    lastMessageTime: chatData.lastMessageTime,
                    unreadCount: chatData.unreadCount || 0,
                    type: userData?.type || 'human',
                    online: userData?.online || false
                };
            } catch (error) {
                console.error(`❌ Error processing user ${otherUserId}:`, error);
                return null;
            }
        });

        const chats = (await Promise.all(chatsPromises)).filter(Boolean) as ChatUser[];
        console.log(`📬 Chats updated! Total chats: ${chats.length}`);
        setChats(chats);
    });
};
