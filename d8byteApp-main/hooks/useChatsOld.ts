import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    addDoc,
    updateDoc,
    doc,
    onSnapshot
} from 'firebase/firestore';
import { firestore, auth } from '@/lib/firebaseConfig';
import {Message} from '@/types/chat';
import {onAuthStateChanged} from "firebase/auth"
import { or, and } from "firebase/firestore";
import { User } from "firebase/auth";

export const useChat = (receiverId: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        });

        // Cleanup auth listener
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        // Only proceed if both current user and receiver ID are available
        console.log(receiverId + " and " + currentUser?.uid);
        if (!receiverId || !currentUser) return;
        console.log("pochla")
        const messagesRef = collection(firestore, 'messages');

        const q = query(
            messagesRef,
            or(
                and(where('senderId', '==', currentUser.uid), where('receiverId', '==', receiverId)),
                and(where('senderId', '==', receiverId), where('receiverId', '==', currentUser.uid))
            ),
            orderBy('timestamp', 'asc')
        );




        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            console.log(fetchedMessages);
            setMessages(fetchedMessages);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [receiverId, currentUser]);



    const sendMessage = async (text: string) => {
        const currentUser = auth.currentUser;
        if (!currentUser || !text.trim()) return;

        const newMessage: Omit<Message, 'id'> = {
            senderId: currentUser.uid,
            receiverId,
            text,
            timestamp: Date.now(),
            seen: false,
            chatId: `${currentUser.uid}_${receiverId}`
        };

        try {
            await addDoc(collection(firestore, 'messages'), newMessage);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const markMessagesSeen = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const unseenMessages = messages.filter(
            msg => msg.receiverId === currentUser.uid && !msg.seen
        );

        const updatePromises = unseenMessages.map(msg =>
            updateDoc(doc(firestore, 'messages', msg.id!), { seen: true })
        );

        await Promise.all(updatePromises);
    };

    return { messages, loading, sendMessage, markMessagesSeen };
};
