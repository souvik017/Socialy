import User from "../Models/user.js";
import { hashPassword, comparePassword } from "../utils/auth.js";
import jwt from "jsonwebtoken";

/* =========================================================
   REGISTER NEW USER
========================================================= */
const newUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    /* -------- Validation -------- */
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    /* -------- Check existing user -------- */
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already registered" });
    }

    /* -------- Hash password -------- */
    const hashedPassword = await hashPassword(password);

    /* -------- Create user -------- */
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    /* -------- Generate token -------- */
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.password = undefined;

    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   LOGIN USER
========================================================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* -------- Validation -------- */
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    /* -------- Find user -------- */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    /* -------- Compare password -------- */
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    /* -------- Generate token -------- */
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    user.password = undefined;

    res.json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   SEARCH USERS (FOR CHAT)
========================================================= */
const allUser = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Search user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================================================
   GET USER BY ID
========================================================= */
const findUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Find user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  newUser,
  login,
  allUser,
  findUser,
};
