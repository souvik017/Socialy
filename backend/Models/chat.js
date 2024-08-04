import mongoose, { Types } from "mongoose";
const { Schema } = mongoose;


const chatSchema = new Schema(
    {
      name: {
        type: String,
        trim: true,
        required: true,
      },
      groupChat: {
        type: Boolean,
        default: false,
      },
      groupAdmin: {
        type:  Types.ObjectId,
         ref: "User" ,
      },
      latestMessage: {
        type: Types.ObjectId,
        ref: "Message",
        },
      members: [
        { type: Types.ObjectId,
         ref: "User" }
        ],
      image: {
        url: String,
        public_id: String,
      }},{
        timestamps:true,
      })

      export default mongoose.model("Chat", chatSchema);
      