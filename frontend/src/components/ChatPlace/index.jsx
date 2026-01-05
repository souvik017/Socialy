import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { CgProfile } from "react-icons/cg";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";
import ScrollableFeed from "react-scrollable-feed";
import InputEmoji from "react-input-emoji";
import { IoMdAttach } from "react-icons/io";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../../socket";
import Loading from "../Loading";

const API_URL = import.meta.env.VITE_API_URL;

const ChatPlace = ({ reciverData, setShowChatPlace }) => {
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const typingTimeoutRef = useRef(null);

  const userId = localStorage.getItem("Id");
  const token = localStorage.getItem("token");
  const chatId = reciverData?._id;

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!userId || !chatId) return;

    if (!socket.connected) {
      socket.connect();
      socket.emit("setup", userId);
    }

    socket.emit("join chat", chatId);

    socket.on("typing", ({ chatId: id }) => {
      if (id === chatId) setIsTyping(true);
    });

    socket.on("stop typing", ({ chatId: id }) => {
      if (id === chatId) setIsTyping(false);
    });

    socket.on("message received", (msg) => {
      if (msg.chat._id === chatId) {
        setMessages((prev) => [...prev, msg]);

        socket.emit("message delivered", {
          messageId: msg._id,
          userId,
        });

        socket.emit("messages read", {
          chatId,
          userId,
        });
      }
    });

    socket.on("message status update", ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, status } : m
        )
      );
    });

    return () => {
      socket.off("typing");
      socket.off("stop typing");
      socket.off("message received");
      socket.off("message status update");
    };
  }, [chatId, userId]);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      const { data } = await axios.get(
        `${API_URL}/message/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(data);
      setLoading(false);

      socket.emit("messages read", { chatId, userId });
    };

    fetchMessages();
  }, [chatId]);

  /* ================= TYPING ================= */
  const typingHandler = (text) => {
    setContent(text);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chatId, userId });
    }

    if (typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", { chatId, userId });
      setTyping(false);
    }, 800);
  };

  /* ================= SEND ================= */
  const handleOnEnter = async () => {
    if (!content.trim()) return;

    socket.emit("stop typing", { chatId, userId });

    const { data } = await axios.post(
      `${API_URL}/message/sendmessage`,
      { content, chatId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    socket.emit("new message", data);
    setMessages((prev) => [...prev, data]);
    setContent("");
  };

  const renderTicks = (msg) => {
    if (msg.readBy?.length > 1)
      return <span className="text-blue-400">✓✓</span>;
    if (msg.deliveredTo?.length > 0)
      return <span className="text-gray-400">✓✓</span>;
    return <span className="text-gray-400">✓</span>;
  };

  const getSender = (members) =>
    members.find((m) => m._id !== userId)?.name;

  if (loading) return <Loading />;

  return (
    <div className="h-screen flex flex-col bg-[#121212]">

      {/* HEADER */}
      <div className="h-[8%] flex items-center px-4 bg-[#1f1f1f]">
        <FaArrowLeft
          onClick={() => setShowChatPlace(false)}
          className="text-white text-xl cursor-pointer"
        />
        <CgProfile className="text-white text-4xl mx-3" />
        <div className="flex-1">
          <p className="text-white font-semibold">
            {getSender(reciverData.members)}
          </p>
          {isTyping && (
            <p className="text-green-400 text-sm">typing…</p>
          )}
        </div>
        <BsThreeDotsVertical className="text-white" />
      </div>

      {/* MESSAGES */}
      <ScrollableFeed className="flex-1 px-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                msg.creator._id === userId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div className="bg-[#2a2a2a] text-white px-3 py-2 rounded-lg max-w-[70%]">
                <p>{msg.content}</p>

                <div className="flex justify-end items-center gap-1 text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {msg.creator._id === userId && renderTicks(msg)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* TYPING DOTS */}
        {isTyping && (
          <div className="flex gap-1 my-2">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
      </ScrollableFeed>

      {/* INPUT */}
      <div className="h-[8%] px-3 flex items-center bg-[#1f1f1f]">
        <IoMdAttach className="text-white text-2xl mr-2" />
        <InputEmoji
          value={content}
          onChange={typingHandler}
          onEnter={handleOnEnter}
          cleanOnEnter
          placeholder="Type a message"
        />
      </div>

      <style>
        {`
          .typing-dot {
            width: 6px;
            height: 6px;
            background: #25d366;
            border-radius: 50%;
            animation: blink 1.4s infinite both;
          }
          .typing-dot:nth-child(2) { animation-delay: .2s }
          .typing-dot:nth-child(3) { animation-delay: .4s }

          @keyframes blink {
            0% { opacity: .2 }
            20% { opacity: 1 }
            100% { opacity: .2 }
          }
        `}
      </style>
    </div>
  );
};

ChatPlace.propTypes = {
  reciverData: PropTypes.object,
  setShowChatPlace: PropTypes.func,
};

export default ChatPlace;
