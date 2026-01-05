import { CgProfile } from "react-icons/cg";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import axios from "axios";
import socket from "../../socket";

const API_URL = import.meta.env.VITE_API_URL;

const ChatCard = ({ setAllChat, setreciverData, handleShowChat }) => {
  const userId = localStorage.getItem("Id");
  const token = localStorage.getItem("token");

  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingChatId, setTypingChatId] = useState(null);

  /* ================= SOCKET SETUP ================= */
  useEffect(() => {
    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
      socket.emit("setup", userId);
    }

    socket.on("online users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("typing", ({ chatId }) => {
      setTypingChatId(chatId);
    });

    socket.on("stop typing", () => {
      setTypingChatId(null);
    });

    socket.on("message received", (message) => {
      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat._id === message.chat._id
            ? {
                ...chat,
                latestMessage: message,
                unreadCount: (chat.unreadCount || 0) + 1,
              }
            : chat
        );

        const moved = updated.find(
          (c) => c._id === message.chat._id
        );
        const rest = updated.filter(
          (c) => c._id !== message.chat._id
        );

        return moved ? [moved, ...rest] : prev;
      });
    });

    socket.on("message status update", ({ messageId, status }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.latestMessage?._id === messageId
            ? {
                ...chat,
                latestMessage: {
                  ...chat.latestMessage,
                  status,
                },
              }
            : chat
        )
      );
    });

    return () => {
      socket.off("online users");
      socket.off("typing");
      socket.off("stop typing");
      socket.off("message received");
      socket.off("message status update");
    };
  }, [userId]);

  /* ================= FETCH CHATS ================= */
  useEffect(() => {
    const fetchChats = async () => {
      const res = await axios.get(`${API_URL}/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const chatsWithUnread = res.data.map((chat) => ({
        ...chat,
        unreadCount: 0,
      }));

      setChats(chatsWithUnread);
    };

    fetchChats();
  }, []);

  /* ================= OPEN CHAT ================= */
  const openChat = async (chat) => {
    const res = await axios.get(`${API_URL}/message/${chat._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    socket.emit("join chat", chat._id);
    socket.emit("messages read", { chatId: chat._id, userId });

    setChats((prev) =>
      prev.map((c) =>
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
    );

    setreciverData(chat);
    setAllChat(res.data);
    handleShowChat();
  };

  /* ================= HELPERS ================= */
  const getSender = (members) =>
    members.find((m) => m._id !== userId)?.name;

  const isOnline = (members) =>
    members.some(
      (m) => m._id !== userId && onlineUsers.includes(m._id)
    );

  const renderTicks = (msg) => {
    if (!msg) return null;
    if (msg.readBy?.length > 1) return "✓✓";
    if (msg.deliveredTo?.length > 0) return "✓";
    return "";
  };

  /* ================= UI ================= */
  return (
    <div className="w-full h-full">
      {chats.map((chat) => (
        <div
          key={chat._id}
          onClick={() => openChat(chat)}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#2a2a2a]"
        >
          <div className="relative text-4xl text-white">
            <CgProfile />
            {isOnline(chat.members) && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full" />
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="text-white font-semibold">
              {chat.groupChat ? chat.name : getSender(chat.members)}
            </p>

            <p className="text-sm text-gray-400 truncate">
              {typingChatId === chat._id
                ? "typing..."
                : chat.latestMessage?.content}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">
              {chat.latestMessage &&
                new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </p>

            <p className="text-xs text-blue-400">
              {renderTicks(chat.latestMessage)}
            </p>

            {chat.unreadCount > 0 && (
              <span className="bg-blue-500 text-xs px-2 py-1 rounded-full text-white">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

ChatCard.propTypes = {
  setAllChat: PropTypes.func,
  setreciverData: PropTypes.func,
  handleShowChat: PropTypes.func,
};

export default ChatCard;
