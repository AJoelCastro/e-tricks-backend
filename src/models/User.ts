import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/User";

const AddressSchema = new Schema(
  {
    name: { type: String, required: true },
    street: { type: String, required: true },
    number: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true } // 👈 esto es implícito, pero puedes dejarlo explícito si quieres
);

const UserSchema = new Schema<IUser>({
  userId: {
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
  addresses: [AddressSchema],
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
      processed: {
        type: Boolean,
        default: false        
      }
    }
  ],
}, {
  timestamps: true
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
