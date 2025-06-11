import mongoose, { Schema } from 'mongoose';

const RoomLikeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const RoomLike = mongoose.model('RoomLike', RoomLikeSchema);
