import mongoose, { Schema, Document } from "mongoose";

export interface IOwnerLike extends Document {
  ownerId: mongoose.Types.ObjectId;     // ID del dueño de la habitación
  userId: mongoose.Types.ObjectId;      // ID del usuario que dio like a la habitación
  roomId: mongoose.Types.ObjectId;      // ID de la habitación que recibió el like
  createdAt: Date;
}

const OwnerLikeSchema = new Schema<IOwnerLike>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
  },
  { timestamps: true }
);

export const OwnerLike = mongoose.model<IOwnerLike>("OwnerLike", OwnerLikeSchema);