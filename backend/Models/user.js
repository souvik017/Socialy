import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatar: String,

  status: {
    type: String,
    enum: ["online", "offline", "away"],
    default: "offline",
  },

  lastSeen: Date,

  settings: {
    readReceipts: { type: Boolean, default: true },
    typingIndicators: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
  },

  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

}, { timestamps: true });

export default mongoose.model('User', userSchema);