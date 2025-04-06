"use client";
import { useState } from 'react';
import { Send } from "lucide-react";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

export default function ChatInput({ onSendMessage }: ChatInputProps) {
    const [messageInput, setMessageInput] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        onSendMessage(messageInput);
        setMessageInput("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="fixed bottom-16 left-0 right-0 bg-black border-t border-gray-700 p-4"
        >
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-gray-600 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:border-[#fe3e00]"
                />
                <button
                    type="submit"
                    className="p-2 bg-[#fe3e00] text-white rounded-full hover:bg-red-600"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}
