import express from "express";
import {
  login,
  newUser,
  allUser,
  findUser,
} from "../Controllers/user.js";
import { protect } from "../Middlewares/authMiddleware.js";

const router = express.Router();

/* =======================
   AUTH
======================= */

router.post("/register", newUser);
router.post("/login", login);

/* =======================
   USERS
======================= */

// Search users
router.get("/", protect, allUser);

// Get user by ID
router.get("/:userId", protect, findUser);

export default router;
