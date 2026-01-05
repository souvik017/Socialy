import mongoose, { Types } from "mongoose";
const { Schema } = mongoose;


const chatSchema = new mongoose.Schema({
  name: String,
  isGroupChat: { type: Boolean, default: false },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  description: String,
  groupAvatar: String,

  pinnedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  mutedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },

}, { timestamps: true });


      export default mongoose.model("Chat", chatSchema);
      