// types/chat.ts
export interface User {
  id: string;
  userName: string;
  room: string;
}

export interface Message {
  sender: string;
  message: string;
  timestamp: string;
}

export interface JoinRoomData {
  room: string;
  userName: string;
}

export interface MessageData {
  room: string;
  sender: string;
  message: string;
}

export interface UsersUpdatedData {
  users: User[];
}

// Add typing indicator types
export interface TypingUser {
  userName: string;
  isTyping: boolean;
}

export interface TypingData {
  room: string;
  userName: string;
  isTyping: boolean;
}
