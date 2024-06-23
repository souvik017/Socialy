import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const messageSchema = new Schema(
  {
    content: string ,
    creator: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chat: {
      type: Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    attachment: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Message', messageSchema);
