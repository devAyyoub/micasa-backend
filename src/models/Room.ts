import mongoose from 'mongoose';

export interface IRoom extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  location: string;
  user: mongoose.Schema.Types.ObjectId;
  images: string[];
}

const roomSchema = new mongoose.Schema<IRoom>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<IRoom>('Room', roomSchema);