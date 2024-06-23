import mongoose, { Types } from "mongoose";
const { Schema, Types } = mongoose;


const chatSchema = new Schema(
    {
      name: {
        type: String,
        trim: true,
        required: true,
      },
      groupChat: {
        type: boolean,
        default: false,
      },
      creator: {
        type:  Types.ObjectId,
         ref: "User" ,
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