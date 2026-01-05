import Chat from "../Models/chat.js";
import User from "../Models/user.js";

/* =========================================================
   ACCESS OR CREATE 1-TO-1 CHAT
========================================================= */
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  if (req.user._id.toString() === userId.toString()) {
    return res.status(400).json({ message: "Cannot chat with yourself" });
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [req.user._id, userId] },
    })
      .populate("members", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name pic email",
        },
      });

    if (chat) {
      return res.status(200).json(chat);
    }

    const otherUser = await User.findById(userId).select("name");

    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const newChat = await Chat.create({
      name: otherUser.name,
      isGroupChat: false,
      members: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id)
      .populate("members", "-password");

    res.status(201).json(fullChat);
  } catch (error) {
    console.error("accessChat error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================================================
   FETCH ALL CHATS FOR LOGGED-IN USER
========================================================= */
const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      members: req.user._id,
    })
      .populate("members", "-password")
      .populate("admins", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name pic email",
        },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("fetchChats error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================================================
   CREATE GROUP CHAT
========================================================= */
const createGroupChat = async (req, res) => {
  const { name, members } = req.body;

  if (!name || !members) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let parsedMembers;
  try {
    parsedMembers = JSON.parse(members);
  } catch {
    return res.status(400).json({ message: "Invalid members format" });
  }

  if (parsedMembers.length < 2) {
    return res.status(400).json({
      message: "At least 3 users (including you) required",
    });
  }

  parsedMembers.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      name,
      isGroupChat: true,
      members: parsedMembers,
      admins: [req.user._id],
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("members", "-password")
      .populate("admins", "-password");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error("createGroupChat error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================================================
   RENAME GROUP CHAT
========================================================= */
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return res.status(400).json({ message: "chatId and chatName required" });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { name: chatName },
      { new: true }
    )
      .populate("members", "-password")
      .populate("admins", "-password");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(updatedChat);
  } catch (error) {
    console.error("renameGroup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================================================
   ADD USER TO GROUP
========================================================= */
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ message: "chatId and userId required" });
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.members.includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    chat.members.push(userId);
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("members", "-password")
      .populate("admins", "-password");

    res.json(updatedChat);
  } catch (error) {
    console.error("addToGroup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================================================
   REMOVE USER FROM GROUP
========================================================= */
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ message: "chatId and userId required" });
  }

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { members: userId } },
      { new: true }
    )
      .populate("members", "-password")
      .populate("admins", "-password");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(updatedChat);
  } catch (error) {
    console.error("removeFromGroup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
