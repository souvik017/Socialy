import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import {
  sendMessage,
  allMessages,
} from "../Controllers/message.js";

const router = express.Router();

/* =======================
   MESSAGES
======================= */

// Send message
router.post("/", protect, sendMessage);

// Get messages of a chat
router.get("/:chatId", protect, allMessages);

export default router;
