import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import userRoute from "./Routes/user.js";
import chatRoute from "./Routes/chatRoute.js";
import messageRoute from "./Routes/message.js";
import Chat from "./Models/chat.js";
import Message from "./Models/message.js";

dotenv.config({ path: "./.env" });

const app = express();
const server = http.createServer(app);

/* ================== MIDDLEWARE ================== */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================== ROUTES ================== */
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/message", messageRoute);

/* ================== DB ================== */
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

/* ================== SOCKET.IO ================== */

const onlineUsers = new Map(); // userId -> socketId
const lastSeen = new Map();    // userId -> timestamp
const userSockets = new Map(); // userId -> Set of socketIds (for multiple devices)

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  /* ---------- USER SETUP ---------- */
  socket.on("setup", (userId) => {
    const userIdStr = String(userId);
    console.log("🔧 Setup event - User:", userIdStr, "Socket:", socket.id);
    
    socket.userId = userIdStr;

    // Handle multiple device connections
    if (!userSockets.has(userIdStr)) {
      userSockets.set(userIdStr, new Set());
    }
    userSockets.get(userIdStr).add(socket.id);

    // Set primary socket
    onlineUsers.set(userIdStr, socket.id);
    
    // Join user to their personal room
    socket.join(userIdStr);
    console.log(`✅ User ${userIdStr} joined personal room`);
    console.log(`   Active sockets for user:`, Array.from(userSockets.get(userIdStr)));
    console.log(`   Rooms for socket ${socket.id}:`, Array.from(socket.rooms));

    // Broadcast online users to all clients
    const onlineUsersList = Array.from(onlineUsers.keys());
    io.emit("online users", onlineUsersList);
    console.log("🟢 Online users:", onlineUsersList);

    // Send connection confirmation
    socket.emit("connected");
  });

  /* ---------- JOIN CHAT ---------- */
  socket.on("join chat", (chatId) => {
    const chatIdStr = String(chatId);
    socket.join(chatIdStr);
    console.log(`📥 User ${socket.userId} joined chat room: ${chatIdStr}`);
    console.log(`   Current rooms:`, Array.from(socket.rooms));
  });

  /* ---------- TYPING ---------- */
  socket.on("typing", async ({ chatId, userId }) => {
    if (!chatId || !userId) {
      console.error("❌ Typing event missing data:", { chatId, userId });
      return;
    }
    
    const chatIdStr = String(chatId);
    const userIdStr = String(userId);
    
    console.log(`\n✍️ TYPING EVENT:`);
    console.log(`   Chat: ${chatIdStr}`);
    console.log(`   User: ${userIdStr}`);

    try {
      const chat = await Chat.findById(chatId).populate('members', '_id');
      if (!chat?.members) {
        console.error(`❌ Chat not found: ${chatIdStr}`);
        return;
      }

      console.log(`   Chat members:`, chat.members.map(m => m._id.toString()));

      // Emit typing to all other members
      let emitCount = 0;
      chat.members.forEach((member) => {
        const memberIdStr = member._id.toString();
        
        if (memberIdStr !== userIdStr) {
          console.log(`   → Emitting to user ${memberIdStr}`);
          
          // Emit to user's personal room (reaches all their devices)
          io.to(memberIdStr).emit("typing", { 
            chatId: chatIdStr, 
            userId: userIdStr 
          });
          
          emitCount++;
        }
      });

      console.log(`   ✅ Total typing events emitted: ${emitCount}\n`);
      
    } catch (error) {
      console.error("❌ Error in typing event:", error);
    }
  });

  /* ---------- STOP TYPING ---------- */
  socket.on("stop typing", async ({ chatId, userId }) => {
    if (!chatId || !userId) {
      console.error("❌ Stop typing event missing data:", { chatId, userId });
      return;
    }
    
    const chatIdStr = String(chatId);
    const userIdStr = String(userId);
    
    console.log(`\n⏸️ STOP TYPING:`);
    console.log(`   Chat: ${chatIdStr}`);
    console.log(`   User: ${userIdStr}`);

    try {
      const chat = await Chat.findById(chatId).populate('members', '_id');
      if (!chat?.members) {
        console.error(`❌ Chat not found: ${chatIdStr}`);
        return;
      }

      // Emit stop typing to all other members
      let emitCount = 0;
      chat.members.forEach((member) => {
        const memberIdStr = member._id.toString();
        
        if (memberIdStr !== userIdStr) {
          console.log(`   → Emitting stop typing to: ${memberIdStr}`);
          
          io.to(memberIdStr).emit("stop typing", { 
            chatId: chatIdStr, 
            userId: userIdStr 
          });
          
          emitCount++;
        }
      });

      console.log(`   ✅ Total stop typing events emitted: ${emitCount}\n`);
      
    } catch (error) {
      console.error("❌ Error in stop typing event:", error);
    }
  });

  /* ---------- NEW MESSAGE ---------- */
  socket.on("new message", async (message) => {
    const chat = message.chat;
    if (!chat?.members) {
      console.error("❌ No chat members found for message");
      return;
    }

    const chatIdStr = String(chat._id);
    const senderId = String(message.creator._id);
    console.log(`\n📨 NEW MESSAGE in chat: ${chatIdStr}`);
    console.log(`   From: ${senderId}`);

    try {
      // Update latest message in chat
      await Chat.findByIdAndUpdate(chatIdStr, {
        latestMessage: message._id,
      });

      // Emit to all other members in the chat
      let emitCount = 0;
      chat.members.forEach((memberId) => {
        const memberIdStr = String(memberId);
        
        if (memberIdStr !== senderId) {
          console.log(`   → Sending to: ${memberIdStr}`);
          
          // Emit to user's personal room
          io.to(memberIdStr).emit("message received", message);
          
          emitCount++;
        }
      });

      console.log(`   ✅ Total message events emitted: ${emitCount}\n`);
    } catch (error) {
      console.error("❌ Error in new message event:", error);
    }
  });

  /* ---------- MESSAGE DELIVERED ---------- */
  socket.on("message delivered", async ({ messageId, userId }) => {
    if (!messageId || !userId) {
      console.error("❌ Message delivered event missing data");
      return;
    }

    console.log(`📬 MESSAGE DELIVERED: ${messageId} by ${userId}`);

    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { 
          $addToSet: { deliveredTo: userId },
          deliveredAt: new Date()
        },
        { new: true }
      ).populate('chat');

      if (message) {
        // Notify sender
        const senderId = String(message.creator);
        io.to(senderId).emit("message status update", {
          messageId,
          status: "delivered",
          userId,
        });
      }
    } catch (error) {
      console.error("❌ Error in message delivered event:", error);
    }
  });

  /* ---------- MESSAGE READ ---------- */
  socket.on("messages read", async ({ chatId, userId }) => {
    if (!chatId || !userId) {
      console.error("❌ Messages read event missing data:", { chatId, userId });
      return;
    }

    const chatIdStr = String(chatId);
    const userIdStr = String(userId);
    
    console.log(`\n👁️ MESSAGES READ:`);
    console.log(`   Chat: ${chatIdStr}`);
    console.log(`   User: ${userIdStr}`);

    try {
      const chat = await Chat.findById(chatId).populate('members', '_id');
      if (!chat?.members) {
        console.error(`❌ Chat not found: ${chatIdStr}`);
        return;
      }

      // Mark all messages in this chat as read by this user
      await Message.updateMany(
        {
          chat: chatId,
          creator: { $ne: userId },
          readBy: { $ne: userId }
        },
        {
          $addToSet: { readBy: userId },
          $set: { readAt: new Date() }
        }
      );

      // Notify all other members
      let emitCount = 0;
      chat.members.forEach((member) => {
        const memberIdStr = member._id.toString();
        
        if (memberIdStr !== userIdStr) {
          console.log(`   → Sending read receipt to: ${memberIdStr}`);
          
          io.to(memberIdStr).emit("messages read", { 
            chatId: chatIdStr, 
            userId: userIdStr,
            readAt: new Date()
          });
          
          emitCount++;
        }
      });

      console.log(`   ✅ Total read receipt events emitted: ${emitCount}\n`);
      
    } catch (error) {
      console.error("❌ Error in messages read event:", error);
    }
  });

  /* ---------- USER STATUS ---------- */
  socket.on("get user status", async ({ userId }) => {
    const userIdStr = String(userId);
    const isOnline = onlineUsers.has(userIdStr);
    const lastSeenTime = lastSeen.get(userIdStr);

    socket.emit("user status", {
      userId: userIdStr,
      isOnline,
      lastSeen: lastSeenTime,
    });
  });

  /* ---------- DISCONNECT ---------- */
  socket.on("disconnect", () => {
    if (!socket.userId) return;

    const userId = socket.userId;
    
    // Remove this socket from user's sockets
    if (userSockets.has(userId)) {
      userSockets.get(userId).delete(socket.id);
      
      // If no more sockets for this user, mark as offline
      if (userSockets.get(userId).size === 0) {
        userSockets.delete(userId);
        onlineUsers.delete(userId);
        lastSeen.set(userId, Date.now());

        // Broadcast updated online users list
        const onlineUsersList = Array.from(onlineUsers.keys());
        io.emit("online users", onlineUsersList);
        
        // Broadcast last seen time
        io.emit("user last seen", {
          userId,
          lastSeen: lastSeen.get(userId),
        });

        console.log(`🔴 User ${userId} disconnected (all devices)`);
      } else {
        console.log(`🔴 Socket ${socket.id} disconnected, user ${userId} still has ${userSockets.get(userId).size} active connection(s)`);
      }
    }

    console.log(`   Online users remaining:`, Array.from(onlineUsers.keys()));
  });

  /* ---------- FORCE DISCONNECT ---------- */
  socket.on("force disconnect", () => {
    console.log("⚠️ Force disconnect for socket:", socket.id);
    socket.disconnect(true);
  });
});

/* ================== SERVER ================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { io };