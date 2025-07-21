import mongoose, { Schema } from "mongoose";
import { IPickUp } from "../interfaces/PickUp";

const PickUpSchema = new Schema<IPickUp>({
    city: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const PickUpModel = mongoose.model<IPickUp>("PickUp", PickUpSchema);
