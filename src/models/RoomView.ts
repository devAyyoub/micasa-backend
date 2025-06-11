import mongoose from "mongoose";

const RoomViewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  },
  { timestamps: true }
);

export const RoomView = mongoose.model("RoomView", RoomViewSchema);