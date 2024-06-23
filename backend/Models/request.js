import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const messageSchema = new Schema(
  {
    sender: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reciever: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
      },
    status : {
        type: String,
        default : "pending",
        enum : ["pending" , "accepted" , "rejected"]
    }
    
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Message', messageSchema);