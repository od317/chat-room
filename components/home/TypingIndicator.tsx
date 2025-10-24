// components/home/TypingIndicator.tsx
"use client";
import { memo } from "react";

interface TypingIndicatorProps {
  typingUsers: string[];
}

const TypingIndicator = memo(function TypingIndicator({
  typingUsers,
}: TypingIndicatorProps) {
  console.log("🔍 TypingIndicator rendering with users:", typingUsers);

  if (typingUsers.length === 0) {
    console.log("🔍 No typing users, returning null");
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
      return `${typingUsers.slice(0, -1).join(", ")} and ${
        typingUsers[typingUsers.length - 1]
      } are typing...`;
    }
  };

  console.log("🔍 Rendering typing indicator with text:", getTypingText());

  return (
    <div className="flex items-center space-x-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded animate-pulse">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
      <span className="text-sm text-blue-700 font-medium">
        {getTypingText()}
      </span>
    </div>
  );
});

export default TypingIndicator;
