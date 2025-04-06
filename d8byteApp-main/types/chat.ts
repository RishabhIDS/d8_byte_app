export interface User {
    uid: string;
    displayName: string;
    photoURL?: string;
    email: string;
}

export interface Message {
    id?: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: number;
    seen: boolean;
    chatId: string;
}

export interface ChatUser {
    unreadCount: any;
    lastMessageTime: number;
    id: string;
    name: string;
    avatar: string;
    lastMessage?: string;
    unread?: boolean;
    type: string;
}
