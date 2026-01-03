import { useEffect, useRef, useState } from 'react';
import PropTypes from "prop-types";
import Sender from "../Sender/index.jsx";
import { CgProfile } from "react-icons/cg";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";
import ScrollableFeed from 'react-scrollable-feed';
import InputEmoji from "react-input-emoji";
import { IoMdAttach } from "react-icons/io";
import axios from 'axios';
import io from "socket.io-client";
import Loading from '../Loading/index.jsx';
import { motion, AnimatePresence } from "framer-motion";


const ENDPOINT = import.meta.env.VITE_API_URL;
let socket;

const ChatPlace = ({ reciverData, setShowChatPlace }) => {
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false); // your typing state
  const [isTyping, setIsTyping] = useState(false); // other user's typing
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const typingTimeoutRef = useRef(null);

  const UserId = localStorage.getItem('Id');
  const chatId = reciverData?._id;
  const API_URL = import.meta.env.VITE_API_URL;

  // -------------------- SOCKET.IO SETUP --------------------
  useEffect(() => {
    if (!UserId) return;

    socket = io(ENDPOINT);
    socket.emit("setup", UserId);

    socket.on("connected", () => console.log("Socket connected"));

    // Typing indicator from others
    socket.on("typing", ({ chatId: typingChatId, userId }) => {
      if (typingChatId === chatId && userId !== UserId) setIsTyping(true);
    });

    socket.on("stop typing", ({ chatId: stopTypingChatId, userId }) => {
      if (stopTypingChatId === chatId && userId !== UserId) setIsTyping(false);
    });

    // New message received
    socket.on("message received", (newMessage) => {
      if (newMessage.chat._id === chatId) {
        setMessages(prev => [...prev, newMessage]);
      } else {
        // Optional: show notifications for other chats
        console.log("New message for another chat:", newMessage.chat._id);
      }
    });

    return () => {
      socket.off("connected");
      socket.off("typing");
      socket.off("stop typing");
      socket.off("message received");
    };
  }, [UserId, chatId]);

  // Join the chat room when chatId changes
  useEffect(() => {
    if (chatId) socket.emit("join Chat", chatId);
  }, [chatId]);

  // -------------------- FETCH MESSAGES --------------------
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const { data } = await axios.get(`${API_URL}/message/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err);
      }
    };

    fetchMessages();
  }, [chatId, API_URL]);

  // -------------------- TYPING HANDLER --------------------
  const typingHandler = (text) => {
    setContent(text);
    if (!socket || !chatId) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chatId, userId: UserId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", { chatId, userId: UserId });
      setTyping(false);
    }, 1000); // 1s idle
  };

  // -------------------- SEND MESSAGE --------------------
const handleOnEnter = async () => {
  if (!chatId) return;
  const token = localStorage.getItem('token');
  if (!token) return;
  if (!content.trim()) return; // prevent empty messages

  try {
    socket.emit("stop typing", { chatId, userId: UserId });
    const { data } = await axios.post(
      `${API_URL}/message/sendmessage`,
      { content, chatId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    socket.emit("new message", data);
    setMessages(prev => [...prev, data]);
    setContent("");
  } catch (err) {
    console.error(err);
  }
};


  const getSender = (Id, members) => members[0]._id === Id ? members[1].name : members[0].name;

  const handleBack = () => setShowChatPlace(false);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="bgImage h-screen w-full flex flex-col">

      {/* HEADER */}
      <div className="w-full h-[8%] bg-[#212121] flex justify-between items-center px-4">
        <div className="flex items-center gap-2">
          <div onClick={handleBack} className="text-white text-2xl cursor-pointer"><FaArrowLeft /></div>
          <CgProfile className="text-white text-4xl" />
          <div>
            <p className="text-white text-xl font-semibold">{getSender(UserId, reciverData.members)}</p>
            
          </div>
        </div>
        <BsThreeDotsVertical className="text-white text-2xl cursor-pointer" />
      </div>

      {/* MESSAGES */}
      <div className="flex flex-col flex-1 px-4 overflow-y-auto">
        <ScrollableFeed >
         <AnimatePresence>
    {messages.map(msg => (
      <motion.div
        key={msg._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
            <Sender key={msg._id} item={msg} />
         </motion.div>
    ))}
  </AnimatePresence>
        </ScrollableFeed>
      
         {isTyping && (
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
  className="flex gap-1 ml-2 my-4 px-2 w-16 h-12 border-2 border-red-600 bg-[#272727] rounded-md justify-center items-center"
>                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
           </motion.div>
            )}
      </div>

      {/* INPUT */}
      <div className="input-fixed h-[8%] px-4 bg-[#212121] flex items-center gap-2"  style={{ height: "8%", minHeight: "50px" }} >
        <IoMdAttach className="text-white text-2xl" />
        <InputEmoji
          value={content}
          onChange={typingHandler}
          cleanOnEnter
          onEnter={handleOnEnter}
          placeholder="Type a message"
          height={20}
        />
      </div>

      {/* TYPING DOTS CSS */}
      <style>
        {`
          .typing-dot {
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            display: inline-block;
            animation: bounce 1.4s infinite;
          }
          .typing-dot:nth-child(1) { animation-delay: 0s; }
          .typing-dot:nth-child(2) { animation-delay: 0.2s; }
          .typing-dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

ChatPlace.propTypes = {
  reciverData: PropTypes.any,
  setShowChatPlace: PropTypes.func,
};

export default ChatPlace;
