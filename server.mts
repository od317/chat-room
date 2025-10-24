// server.js
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store connected users by room { room: Map<socketId, user> }
const roomUsers = new Map();
// Store typing status by room { room: Map<userName, boolean> }
const roomTypingStatus = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    socket.on("join-room", (data) => {
      const { room, userName } = data;
      console.log(`🎯 Join-room event received:`, data);

      socket.join(room);
      console.log(`👤 ${userName} joined room: ${room}`);

      // Initialize room if it doesn't exist
      if (!roomUsers.has(room)) {
        roomUsers.set(room, new Map());
        roomTypingStatus.set(room, new Map());
        console.log(`🏠 Created new room: ${room}`);
      }

      // Add user to room
      roomUsers.get(room).set(socket.id, {
        id: socket.id,
        userName: userName,
        room: room,
      });

      // Get current users for debugging
      const currentUsers = Array.from(roomUsers.get(room).values());
      console.log(`📊 Current users in room ${room}:`, currentUsers);

      // Notify others about new user
      socket.to(room).emit("user-joined", {
        userName,
        timestamp: new Date().toISOString(),
      });
      console.log(`📢 Notified room ${room} about new user: ${userName}`);

      // Send updated user list to everyone in the room (INCLUDING the new user)
      const users = Array.from(roomUsers.get(room).values());
      console.log(`🔄 Sending users-updated to room ${room}:`, users);
      io.to(room).emit("users-updated", { users });
    });

    socket.on("message", (data) => {
      const { room, sender, message } = data;
      console.log(`💬 Message from ${sender} in room ${room}: ${message}`);

      // Create message with timestamp
      const messageWithTimestamp = {
        sender,
        message,
        timestamp: new Date().toISOString(),
      };

      socket.to(room).emit("message", messageWithTimestamp);

      // Stop typing indicator when message is sent
      if (roomTypingStatus.has(room)) {
        roomTypingStatus.get(room).delete(sender);
        // Notify everyone that this user stopped typing
        socket.to(room).emit("user-typing", {
          userName: sender,
          isTyping: false,
        });
      }
    });

    // Handle typing events
    socket.on("user-typing", (data) => {
      const { room, userName, isTyping } = data;
      console.log(
        `⌨️ ${userName} is ${
          isTyping ? "typing" : "not typing"
        } in room ${room}`
      );

      if (!roomTypingStatus.has(room)) {
        roomTypingStatus.set(room, new Map());
      }

      const typingStatus = roomTypingStatus.get(room);

      if (isTyping) {
        // Set typing status to true and set a timeout to auto-clear after 3 seconds
        typingStatus.set(userName, true);

        // Clear previous timeout if exists
        if (typingStatus.timeoutId) {
          clearTimeout(typingStatus.timeoutId);
        }

        // Set new timeout to clear typing status after 3 seconds
        typingStatus.timeoutId = setTimeout(() => {
          if (typingStatus.has(userName)) {
            typingStatus.delete(userName);
            socket.to(room).emit("user-typing", {
              userName,
              isTyping: false,
            });
          }
        }, 3000);
      } else {
        // User stopped typing
        typingStatus.delete(userName);
      }

      // Broadcast typing status to other users in the room
      socket.to(room).emit("user-typing", {
        userName,
        isTyping,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);

      // Remove user from all rooms and notify others
      roomUsers.forEach((users, room) => {
        if (users.has(socket.id)) {
          const disconnectedUser = users.get(socket.id);
          users.delete(socket.id);

          console.log(
            `🗑️ Removed user ${disconnectedUser.userName} from room ${room}`
          );

          // Clear typing status for disconnected user
          if (roomTypingStatus.has(room)) {
            roomTypingStatus.get(room).delete(disconnectedUser.userName);
          }

          // Notify room about user leaving
          socket.to(room).emit("user-left", {
            userName: disconnectedUser.userName,
            timestamp: new Date().toISOString(),
          });

          // Send updated user list to remaining users
          const updatedUsers = Array.from(users.values());
          console.log(
            `🔄 Sending updated users list after disconnect:`,
            updatedUsers
          );
          io.to(room).emit("users-updated", { users: updatedUsers });
        }
      });
    });

    socket.on("leave-room", (data) => {
      const { room } = data;
      console.log(
        `🚪 Leave-room event for room: ${room}, socket: ${socket.id}`
      );

      if (roomUsers.has(room) && roomUsers.get(room).has(socket.id)) {
        const leavingUser = roomUsers.get(room).get(socket.id);
        roomUsers.get(room).delete(socket.id);

        // Clear typing status for leaving user
        if (roomTypingStatus.has(room)) {
          roomTypingStatus.get(room).delete(leavingUser.userName);
        }

        socket.leave(room);

        console.log(`👋 User ${leavingUser.userName} left room ${room}`);

        // Notify room about user leaving
        socket.to(room).emit("user-left", {
          userName: leavingUser.userName,
          timestamp: new Date().toISOString(),
        });

        // Send updated user list to remaining users
        const updatedUsers = Array.from(roomUsers.get(room).values());
        console.log(`🔄 Sending updated users list after leave:`, updatedUsers);
        io.to(room).emit("users-updated", { users: updatedUsers });
      }
    });

    // Add a debug endpoint to check room status
    socket.on("debug-room", (data) => {
      const { room } = data;
      console.log(`🔍 Debug request for room: ${room}`);
      if (roomUsers.has(room)) {
        const users = Array.from(roomUsers.get(room).values());
        console.log(`🔍 Room ${room} users:`, users);
        socket.emit("debug-response", { room, users });
      } else {
        console.log(`🔍 Room ${room} does not exist`);
        socket.emit("debug-response", { room, users: [] });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 server is running on http://${hostname}:${port}`);
  });
});
