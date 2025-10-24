// components/home/UsersList.tsx
"use client";
import { User } from "@/types/chat";
import { memo } from "react";

interface UsersListProps {
  users: User[];
  currentUser: string;
  onlineCount: number;
}

// React.memo: Prevent re-renders if props haven't changed
const UsersList = memo(function UsersList({
  users,
  currentUser,
  onlineCount,
}: UsersListProps) {
  console.log("UsersList rendering"); // This will help you see when it re-renders

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4">
      <h3 className="font-bold text-lg mb-4">Online Users ({onlineCount})</h3>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center space-x-2 p-2 rounded ${
              user.userName === currentUser ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">
              {user.userName}
              {user.userName === currentUser && " (You)"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default UsersList;
