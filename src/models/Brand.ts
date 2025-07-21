import mongoose, { Schema } from "mongoose";
import { IBrand } from "../interfaces/Brand";

const BrandSchema = new Schema<IBrand>({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const BrandModel = mongoose.model<IBrand>("Brand", BrandSchema);