// components/home/ChatForm.tsx (Updated timing logic)
"use client";
import React, { useState, useCallback, useRef } from "react";
import { socket } from "@/lib/socketClient";

interface ChatFormProps {
  onSendMessage: (message: string) => void;
  room: string;
  userName: string;
}

export default function ChatForm({
  onSendMessage,
  room,
  userName,
}: ChatFormProps) {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Debounced typing indicator
  const handleTyping = useCallback(
    (isTyping: boolean) => {
      // Only emit if the state actually changed
      if (isTyping !== isTypingRef.current) {
        console.log(`⌨️ Form: Emitting typing ${isTyping} for ${userName}`);
        socket.emit("user-typing", { room, userName, isTyping });
        isTypingRef.current = isTyping;
      }
    },
    [room, userName]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMessage = e.target.value;
      setMessage(newMessage);

      // Handle typing indicators
      if (newMessage.trim().length > 0) {
        // User started typing or is still typing
        handleTyping(true);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          console.log("⌨️ Form: Auto-stop typing due to inactivity");
          handleTyping(false);
        }, 2000);
      } else {
        // User cleared the input
        console.log("⌨️ Form: Input cleared, stopping typing");
        handleTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    },
    [handleTyping]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (message.trim()) {
        console.log("⌨️ Form: Message sent, stopping typing");
        onSendMessage(message);
        setMessage("");

        // Clear typing indicator when message is sent
        handleTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    },
    [message, onSendMessage, handleTyping]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  // Clean up timeout on unmount
  const handleBlur = useCallback(() => {
    console.log("⌨️ Form: Input lost focus, stopping typing");
    handleTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [handleTyping]);

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
      >
        Send
      </button>
    </form>
  );
}
