import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
  chatRoomId: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true },
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model("Message", MessageSchema);