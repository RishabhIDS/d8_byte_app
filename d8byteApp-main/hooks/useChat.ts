import {auth, firestore} from "@/firebase/firebaseConfig";
import {
    addDoc,
    collection,
// @ts-ignore
//     debounce,
    doc,
    getDocs,
    increment,
    onSnapshot,
    orderBy,
    query,
    setDoc, updateDoc,
    where, writeBatch
} from "firebase/firestore";
import {generateChatId, listenForTypingStatus, updateTypingStatus, updateUserOnlineStatus} from "@/utils/ChatHelper";
import {useCallback, useEffect, useState} from "react";
import {onAuthStateChanged, User} from "firebase/auth";
import {Message} from "yup";
import { debounce } from 'lodash';

export const useChat = (receiverId: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                // Update online status when user logs in
                updateUserOnlineStatus(user.uid, true);
            } else {
                setCurrentUser(null);
            }
        });

        // Set user offline when component unmounts
        return () => {
            unsubscribeAuth();
            if (currentUser) {
                updateUserOnlineStatus(currentUser.uid, false);
            }
        };
    }, []);

    useEffect(() => {
        if (!receiverId || !currentUser) return;

        const chatId = generateChatId(currentUser.uid, receiverId);

        // Listen for messages in this chat
        const messagesRef = collection(firestore, 'messages', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));

            setMessages(fetchedMessages);
            setLoading(false);

            // Mark messages as seen when they're loaded
            markMessagesSeen();
        });

        // Listen for typing status
        const typingUnsubscribe = listenForTypingStatus(receiverId, chatId, (typing) => {
            setIsTyping(typing);
        });

        return () => {
            unsubscribe();
            typingUnsubscribe();
        };
    }, [receiverId, currentUser]);

    // Handle typing state with debounce
    const setTypingStatus = (isTyping: boolean) => {
        if (!currentUser || !receiverId) return;

        const chatId = generateChatId(currentUser.uid, receiverId);
        updateTypingStatus(currentUser.uid, chatId, isTyping);
    };

    // Debounce typing status updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetTypingStatus = useCallback(
        debounce((isTyping: boolean) => setTypingStatus(isTyping), 500),
        [currentUser, receiverId]
    );

    // Send a message
    const sendMessage = async (text: string) => {
        if (!currentUser || !text.trim()) {
            console.warn("⚠️ No user or empty message. Message not sent.");
            return;
        }

        const chatId = generateChatId(currentUser.uid, receiverId);
        console.log(`💬 Sending message in chat: ${chatId}`);

        // Reset typing status
        setTypingStatus(false);
        console.log("✍️ Typing status reset.");

        const newMessage = {
            senderId: currentUser.uid,
            text,
            timestamp: Date.now(),
            seen: false
        };

        try {
            // Add message to Firestore
            console.log("📩 Adding message to Firestore...");
            await addDoc(collection(firestore, 'messages', chatId, 'messages'), newMessage);
            console.log("✅ Message successfully added!");

            // Update last message for both users
            const currentUserChatRef = doc(firestore, 'users', currentUser.uid, 'chats', receiverId);
            const receiverChatRef = doc(firestore, 'users', receiverId, 'chats', currentUser.uid);
            console.log("abhi ka text ye hai", text);
            const chatUpdate = {
                lastMessage: text,
                lastMessageTime: Date.now()
            };

            // Update sender's chat
            console.log(`📤 Updating sender's chat (${currentUser.uid})...`);
            await setDoc(currentUserChatRef, chatUpdate, { merge: true });
            console.log("✅ Sender's chat updated!");

            // Update receiver's chat & unread count
            console.log(`📥 Updating receiver's chat (${receiverId})...`);
            await setDoc(receiverChatRef, {
                ...chatUpdate,
                unreadCount: increment(1)
            }, { merge: true });
            console.log("✅ Receiver's chat updated with unread count incremented!");

        } catch (error) {
            console.error("❌ Error sending message:", error);
        }
    };


    // Mark messages as seen
    const markMessagesSeen = async () => {
        if (!currentUser || !receiverId) return;

        const chatId = generateChatId(currentUser.uid, receiverId);

        try {
            // Reset unread count in current user's chat with receiver
            const chatRef = doc(firestore, 'users', currentUser.uid, 'chats', receiverId);
            await updateDoc(chatRef, {
                unreadCount: 0
            });

            // Mark all unseen messages as seen
            const messagesRef = collection(firestore, 'messages', chatId, 'messages');
            const q = query(
                messagesRef,
                where('senderId', '==', receiverId),
                where('seen', '==', false)
            );

            const snapshot = await getDocs(q);

            const batch = writeBatch(firestore);
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { seen: true });
            });

            await batch.commit();
        } catch (error) {
            console.error('Error marking messages as seen:', error);
        }
    };

    // Handle input changes to update typing status
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target?.value;

        // Set typing status if there's text
        if (value?.length > 0) {
            setTypingStatus(true);
            // Set typing to false after delay when user stops typing
            debouncedSetTypingStatus(false);
        } else {
            setTypingStatus(false);
        }

        return value;
    };

    return {
        messages,
        loading,
        sendMessage,
        markMessagesSeen,
        isTyping,
        handleInputChange
    };
};
