import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import { accessChat, addToGroup, createGroupChat, fetchChats, removeFromGroup, renameGroup } from "../Controllers/chat.js";

const app = express.Router();

app.route("/").post(protect, accessChat);
app.route("/").get(protect, fetchChats);
app.route("/group").post(protect, createGroupChat);
app.route("/rename").put (protect, renameGroup);
app.route("/groupremove").put (protect, removeFromGroup);
app.route("/groupadd").put(protect, addToGroup);

export default app;