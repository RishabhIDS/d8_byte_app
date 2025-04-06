"use client";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search, Bot } from "lucide-react";
import {
    collection,
    query,
    where,
    onSnapshot,
    limit,
    orderBy
} from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebaseConfig';
import { ChatUser, Message } from '@/types/chat';
import NavbarPage from '@/components/NavbarPage';
import {AIBot, AiBots} from "@/lib/aiBots";
import {undefined} from "zod";
import Image from "next/image";

export default function ChatList() {
    const router = useRouter();
    const [chats, setChats] = useState<ChatUser[] | AIBot>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            router.push('/login');
            return;
        }

        // Fetch recent chats
        const messagesRef = collection(firestore, 'messages');
        const q = query(
            messagesRef,
            where('chatId', 'array-contains', currentUser.uid),
            orderBy('timestamp', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatUsers: { [key: string]: ChatUser } = {};

            snapshot.docs.forEach(doc => {
                const message = doc.data() as Message;
                const otherUserId = message.senderId === currentUser.uid
                    ? message.receiverId
                    : message.senderId;

                if (!chatUsers[otherUserId]) {
                    chatUsers[otherUserId] = {
                        lastMessageTime: 0, type: "", unreadCount: undefined,
                        id: otherUserId,
                        name: otherUserId, // Replace with actual user fetching
                        avatar: '/images/default-avatar.png',
                        lastMessage: message.text,
                        unread: !message.seen && message.receiverId === currentUser.uid
                    };
                }
            });

            // Add AI bots
            const botChats = (Array.isArray(AiBots)
                ? AiBots.map(bot => ({
                    id: bot.id,
                    name: bot.name,
                    avatar: bot.avatar,
                    lastMessage: "Hi! I'd love to get to know you better!",
                    unread: true,
                    type: 'bot',
                    unreadCount: 0,
                    lastMessageTime: new Date().getTime(),
                }))
                : []);

            setChats([...Object.values(chatUsers), ...botChats]);
        });

        return () => unsubscribe();
    }, [router]);

    const filteredChats = (Array.isArray(chats) ? chats : []).filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black text-white pt-[-64px] pb-20">
            <NavbarPage />
            <div className="max-w-lg mx-auto px-4">
                <div className="mb-6 mt-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe3e00]"
                        />
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="space-y-2">
                    {filteredChats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => router.push(`/chat/${chat.id}`)}
                            className="bg-gray-800 p-4 rounded-lg shadow-sm flex items-center space-x-4 cursor-pointer hover:bg-gray-700"
                        >
                            <Image
                                src={chat.avatar}
                                alt={chat.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className={`font-medium truncate flex items-center gap-2 ${chat.name === 'Sarah Parker' ? 'text-[#fe3e00]' : ''}`}>
                                        {chat.name}
                                        {chat.type === "bot" && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex items-center gap-1">
                        <Bot className="w-3 h-3" /> AI
                      </span>
                                        )}
                                    </h3>
                                    <span className="text-xs text-gray-400 flex-shrink-0">
                    {/* Add time logic here */}
                  </span>
                                </div>
                                <p className="text-sm text-gray-300 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread && (
                                <div className="w-3 h-3 bg-[#fe3e00] rounded-full flex-shrink-0"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
