import mongoose, { Schema } from 'mongoose';

const RoomMatchSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const RoomMatch = mongoose.model('RoomMatch', RoomMatchSchema);
