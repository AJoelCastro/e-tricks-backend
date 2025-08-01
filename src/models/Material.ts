import mongoose, { Schema} from "mongoose";
import { IMaterial } from "../interfaces/Material";

const MaterialSchema = new Schema<IMaterial>({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const MaterialModel = mongoose.model<IMaterial>("Material", MaterialSchema);
