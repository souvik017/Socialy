import Chat from "../Models/chat.js";
import Message from "../Models/message.js";

/* =========================================================
   SEND MESSAGE
========================================================= */
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!chatId || (!content && !req.file)) {
    return res.status(400).json({
      message: "chatId and message content or attachment required",
    });
  }

  try {
    let message = await Message.create({
      sender: req.user._id,
      chat: chatId,
      content: content || "",
      attachments: req.file ? [req.file.path] : [],
    });

    message = await message
      .populate("sender", "name pic email")
      .populate({
        path: "chat",
        populate: {
          path: "members",
          select: "name pic email",
        },
      });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("❌ sendMessage error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================================================
   GET ALL MESSAGES OF A CHAT
========================================================= */
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ allMessages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

/* =========================================================
   MARK MESSAGES AS READ
========================================================= */
const markMessagesAsRead = async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: "chatId is required" });
  }

  try {
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      {
        $addToSet: { readBy: req.user._id },
        $set: { readAt: new Date() },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("❌ markMessagesAsRead error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/* =========================================================
   DELETE MESSAGE (SOFT DELETE)
========================================================= */
const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const msg = await Message.findById(messageId);

    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (msg.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    msg.deleted = true;
    msg.content = "This message was deleted";
    msg.attachments = [];
    await msg.save();

    res.json(msg);
  } catch (error) {
    console.error("❌ deleteMessage error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  sendMessage,
  allMessages,
  markMessagesAsRead,
  deleteMessage,
};
