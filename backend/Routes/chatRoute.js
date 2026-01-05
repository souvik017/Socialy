import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../Controllers/chat.js";

const router = express.Router();

/* =======================
   CHAT
======================= */

// Create / Access one-to-one chat
router.post("/", protect, accessChat);

// Fetch all chats of logged-in user
router.get("/", protect, fetchChats);

/* =======================
   GROUP CHAT
======================= */

// Create group
router.post("/group", protect, createGroupChat);

// Rename group
router.put("/group/:chatId/rename", protect, renameGroup);

// Add member
router.put("/group/:chatId/add", protect, addToGroup);

// Remove member
router.put("/group/:chatId/remove", protect, removeFromGroup);

export default router;
