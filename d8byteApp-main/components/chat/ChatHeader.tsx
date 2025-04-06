"use client";
import { ArrowLeft, Bot } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
    user: {
        name: string;
        avatar: string;
        type?: 'user' | 'bot';
    };
    onBack?: () => void;
}

export default function ChatHeader({ user, onBack }: ChatHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.push('/chat');
        }
    };

    return (
        <div className="bg-black border-b border-gray-700 px-4 py-3 flex items-center fixed top-0 left-0 right-0 z-10">
            <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-800 rounded-full mr-2"
            >
                <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <img
                src={user.avatar || '/images/default-avatar.png'}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div className="flex-1">
                <h2 className="font-semibold flex items-center gap-2 text-[#fe3e00]">
                    {user.name}
                    {user.type === "bot" && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex items-center gap-1">
              <Bot className="w-3 h-3" /> AI
            </span>
                    )}
                </h2>
                <p className="text-xs text-[#fe3e00]">Online</p>
            </div>
        </div>
    );
}
