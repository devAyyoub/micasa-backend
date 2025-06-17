import mongoose, { Schema } from "mongoose";

const ChatRoomSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  roomId: { type: Schema.Types.ObjectId, ref: "Room" }, // opcional
  matchId: { type: Schema.Types.ObjectId, ref: "RoomMatch" }, // opcional
  createdAt: { type: Date, default: Date.now },
});

export const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);