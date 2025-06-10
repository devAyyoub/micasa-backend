import mongoose from 'mongoose';

export interface IRoom extends mongoose.Document {
  title: string;
  description: string;
  price: number;
  location: string;
  user: mongoose.Schema.Types.ObjectId;
  images: string[];
  sociability: 'alta' | 'media' | 'baja';
  minRoommateAge?: number;
  maxRoommateAge?: number;
  rentalDuration: 'corto' | 'medio' | 'largo';
  preferences: {
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    preferredGender?: 'masculino' | 'femenino' | 'indiferente';
  };
}

const roomSchema = new mongoose.Schema<IRoom>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: String }],
    sociability: {
      type: String,
      enum: ['alta', 'media', 'baja'],
      default: 'media',
    },
    minRoommateAge: { type: Number },
    maxRoommateAge: { type: Number },
    rentalDuration: {
      type: String,
      enum: ['corto', 'medio', 'largo'],
      default: 'medio',
    },
    preferences: {
      smokingAllowed: { type: Boolean, default: false },
      petsAllowed: { type: Boolean, default: false },
      preferredGender: {
        type: String,
        enum: ['masculino', 'femenino', 'indiferente'],
        default: 'indiferente',
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRoom>('Room', roomSchema);