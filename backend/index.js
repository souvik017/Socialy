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
    }
  });
  
  io.on("connection", socket => {
    // console.log("connected to socket.io");
  
   
    socket.on("setup", (Id) => {
      socket.join(Id);
      socket.emit("connected");
    });

    socket.on('join Chat',(room)=>{
      socket.join(room);
      console.log("user joined in room", room)
    })
    socket.on("typing", (room) => {
      socket.broadcast.emit("typing" , room);
    });
  
    socket.on('stop typing', (room) => {
      socket.broadcast.emit("stop typing" , room);
    });
    

    socket.on("new message", (newMessageRecived)=>{
      var Chat = newMessageRecived;
     
      if(!Chat.chat.members) return console.log("members not defined");
  
      Chat.chat.members.forEach((members) => {
        if (members === newMessageRecived.creator._id) return;

        socket.in(members).emit("message received", newMessageRecived);
      });
  
    })
  
  });
  
 
 
  server.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
  });