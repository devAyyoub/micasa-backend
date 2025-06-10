import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  favorites: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);