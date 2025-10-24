// components/home/ChatMessage.tsx
"use client";

interface ChatMessageProps {
  message: string;
  sender: string;
  isOwnMessage: boolean;
  timestamp: string; // Add timestamp prop
}

export default function ChatMessage({
  message,
  sender,
  isOwnMessage,
  timestamp,
}: ChatMessageProps) {
  // Format the timestamp to a readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format date for today/yesterday or full date
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      new Date(now.setDate(now.getDate() - 1)).toDateString() ===
      date.toDateString();

    if (isToday) {
      return "Today";
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const messageTime = formatTime(timestamp);
  const messageDate = formatDate(timestamp);

  return (
    <div className={`mb-4 ${isOwnMessage ? "text-right" : ""}`}>
      {/* Show date separator if this is a new day */}
      {/* You might want to implement date grouping logic here */}

      <div
        className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
          isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        {/* Sender name for others' messages */}
        {!isOwnMessage && sender !== "System" && (
          <div className="font-bold text-sm mb-1">{sender}</div>
        )}

        {/* System messages styling */}
        {sender === "System" && (
          <div className="text-xs text-gray-500 mb-1 text-center italic">
            System
          </div>
        )}

        {/* Message content */}
        <div className={sender === "System" ? "italic" : ""}>{message}</div>

        {/* Timestamp */}
        <div
          className={`text-xs mt-1 ${
            isOwnMessage
              ? "text-blue-100"
              : sender === "System"
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
          {messageTime}
        </div>
      </div>

      {/* Full date tooltip on hover (optional) */}
      <div className="text-xs text-gray-400 mt-1 opacity-0 hover:opacity-100 transition-opacity">
        {messageDate}
      </div>
    </div>
  );
}
