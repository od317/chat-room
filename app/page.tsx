// app/page.tsx
"use client";
import ChatForm from "@/components/home/ChatForm";
import ChatMessage from "@/components/home/ChatMessage";
import UsersList from "@/components/home/UsersList";
import TypingIndicator from "@/components/home/TypingIndicator";
import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { socket } from "@/lib/socketClient";
import { Message, User } from "@/types/chat";

// Memoize the ChatMessage component to prevent unnecessary re-renders
const MemoizedChatMessage = memo(ChatMessage);

export default function Home() {
  const [room, setRoom] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // useCallback: Memoize event handlers
  const handleSendMessage = useCallback(
    (message: string) => {
      const data = { room, sender: userName, message };
      socket.emit("message", data);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: userName,
          message,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    [room, userName]
  );

  const handleJoinRoom = useCallback(() => {
    if (room && userName) {
      console.log(`🟡 Client: Joining room ${room} as ${userName}`);
      socket.emit("join-room", { room, userName });
      setIsJoined(true);
    }
  }, [room, userName]);

  const handleLeaveRoom = useCallback(() => {
    console.log(`🟡 Client: Leaving room ${room}`);
    socket.emit("leave-room", { room });
    setIsJoined(false);
    setUsers([]);
    setMessages([]);
    setTypingUsers([]);
  }, [room]);

  const handleUserNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserName(e.target.value);
    },
    []
  );

  const handleRoomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRoom(e.target.value);
    },
    []
  );

  // useMemo: Memoize computed values
  const onlineUsersCount = useMemo(() => {
    return users.length;
  }, [users]);

  // Filter out current user from typing indicators
  const otherUsersTyping = useMemo(() => {
    return typingUsers.filter((user) => user !== userName);
  }, [typingUsers, userName]);

  // Memoize the join form JSX
  const joinForm = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">
          Join Chat Room
        </h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={handleUserNameChange}
          className="w-full mb-4 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="Enter room ID"
          value={room}
          onChange={handleRoomChange}
          className="w-full mb-6 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleJoinRoom}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
        >
          Join Room
        </button>
      </div>
    ),
    [userName, room, handleUserNameChange, handleRoomChange, handleJoinRoom]
  );

  // Memoize the chat interface JSX
  const chatInterface = useMemo(
    () => (
      <div className="flex w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h1 className="text-xl font-bold text-gray-800">Room: {room}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <strong>{userName}</strong>
              </span>
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 rounded bg-red-500 text-white text-sm hover:bg-red-600 focus:outline-none transition duration-200"
              >
                Leave Room
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex">
            <div className="flex-1 flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 min-h-80 max-h-100 bg-gray-50">
                {messages.map((msg, index) => (
                  <MemoizedChatMessage
                    key={`${msg.timestamp}-${index}`}
                    message={msg.message}
                    sender={msg.sender}
                    isOwnMessage={msg.sender === userName}
                    timestamp={msg.timestamp}
                  />
                ))}

                {/* Typing Indicator */}
                <TypingIndicator typingUsers={otherUsersTyping} />
              </div>

              {/* Chat Input */}
              <div className="border-t bg-white">
                <div className="p-4">
                  <ChatForm
                    onSendMessage={handleSendMessage}
                    room={room}
                    userName={userName}
                  />
                </div>
              </div>
            </div>

            {/* Users List */}
            <UsersList
              users={users}
              currentUser={userName}
              onlineCount={onlineUsersCount}
            />
          </div>
        </div>
      </div>
    ),
    [
      room,
      userName,
      handleLeaveRoom,
      messages,
      users,
      onlineUsersCount,
      handleSendMessage,
      otherUsersTyping,
    ]
  );

  useEffect(() => {
    console.log("🔍 Setting up socket event listeners");

    const handleMessage = (data: {
      sender: string;
      message: string;
      timestamp: string;
    }) => {
      console.log("🟡 Client: Received message:", data);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: data.sender,
          message: data.message,
          timestamp: data.timestamp,
        },
      ]);
    };

    const handleUserJoined = (data: {
      userName: string;
      timestamp: string;
    }) => {
      console.log("🟡 Client: User joined:", data);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "System",
          message: `${data.userName} joined the room.`,
          timestamp: data.timestamp,
        },
      ]);
    };

    const handleUserLeft = (data: { userName: string; timestamp: string }) => {
      console.log("🟡 Client: User left:", data);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "System",
          message: `${data.userName} left the room.`,
          timestamp: data.timestamp,
        },
      ]);

      // Remove from typing users if they were typing
      setTypingUsers((prev) => prev.filter((user) => user !== data.userName));
    };

    const handleUsersUpdated = (data: { users: User[] }) => {
      console.log("🟡 Client: Users updated:", data.users);
      setUsers(data.users);
    };

    const handleUserTyping = (data: {
      userName: string;
      isTyping: boolean;
    }) => {
      console.log("⌨️ Client: Typing event received:", data);

      setTypingUsers((prev) => {
        console.log("⌨️ Current typing users before update:", prev);

        let newTypingUsers;
        if (data.isTyping) {
          // Add user to typing list if not already present and not current user
          if (!prev.includes(data.userName) && data.userName !== userName) {
            newTypingUsers = [...prev, data.userName];
            console.log("⌨️ Added user to typing list:", newTypingUsers);
          } else {
            newTypingUsers = prev;
          }
        } else {
          // Remove user from typing list
          newTypingUsers = prev.filter((user) => user !== data.userName);
          console.log("⌨️ Removed user from typing list:", newTypingUsers);
        }

        return newTypingUsers;
      });
    };

    // Set up event listeners
    socket.on("message", handleMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("users-updated", handleUsersUpdated);
    socket.on("user-typing", handleUserTyping);

    // Log connection status
    socket.on("connect", () => {
      console.log("✅ Client: Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("❌ Client: Disconnected from server");
    });

    // Clean up event listeners
    return () => {
      console.log("🔍 Cleaning up socket event listeners");
      socket.off("message", handleMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("users-updated", handleUsersUpdated);
      socket.off("user-typing", handleUserTyping);
    };
  }, [userName]);

  return (
    <div className="flex mt-24 justify-center w-full pb-[10%] px-4">
      {!isJoined ? joinForm : chatInterface}
    </div>
  );
}
