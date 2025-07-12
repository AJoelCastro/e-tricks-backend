import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/User";

const UserSchema = new Schema<IUser>({
  idClerk: {
    type: String,
    required: true,
    unique: true,
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }
  ],
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
    }
  ],
}, {
  timestamps: true
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
