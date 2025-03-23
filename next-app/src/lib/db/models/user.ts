import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  googleUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    googleUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    photoURL: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'User',
  }
);

// Check if the User model already exists to prevent overwriting it
// This is needed for hot reloading in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 