import express from "express";
import { protect } from "../Middlewares/authMiddleware.js";
import { allMessage, sendMessage } from "../Controllers/message.js";


const app = express.Router();

app.route("/sendmessage").post(protect, sendMessage);
app.route("/:chatId").get(protect, allMessage);

export default app;