import express from "express";
const app = express();
import userRoute from "./Routes/user.js"
import messageRoute from "./Routes/message.js"
import chatRoute from "./Routes/chatRoute.js"
import dotenv from "dotenv"
import mongoose from "mongoose";
import cors from "cors"
import { Server } from "socket.io"; 
import http from "http";
// import io from "socket.io";

dotenv.config({
    path: "./.env"
})


const port = process.env.PORT;
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/message", messageRoute);

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log("Database Connected Succesfully");
  })
  .catch((err) => console.log("DB CONNECTION ERR => ", err));

  const server = http.createServer(app);


  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:5173", // Ensure no trailing slash
       methods: ["GET", "POST"],
    credentials: true
    }
  });
  
 io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // User setup
  socket.on("setup", (userId) => {
    socket.join(userId); // each user has a personal room
    socket.emit("connected");
  });

  // Join chat room
  socket.on("join Chat", (chatId) => {
    socket.join(chatId);
    console.log("User joined room:", chatId);
  });

socket.on("typing", ({ chatId, userId }) => {
    console.log(`Typing event from user ${userId} in chat ${chatId}`);
    socket.to(chatId).emit("typing", { chatId, userId });
  });

  socket.on("stop typing", ({ chatId, userId }) => {
    console.log(`Stop typing from user ${userId} in chat ${chatId}`);
    socket.to(chatId).emit("stop typing", { chatId, userId });
  });

  // New message
  socket.on("new message", (newMessageRecived) => {
    const chat = newMessageRecived.chat;
    if (!chat.members) return console.log("Chat members not defined");

    chat.members.forEach((memberId) => {
      if (memberId === newMessageRecived.creator._id) return; // don't send to sender
      io.to(memberId).emit("message received", newMessageRecived); // send to each member
    });
  });
});

  
  app.get("/", () => {
    console.log(`Server is running at port: ${port}`);
  });
  server.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
  });