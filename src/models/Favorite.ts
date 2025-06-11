import mongoose, { Schema } from "mongoose";
import { IFavorite } from "../interfaces/Favorite";

const favoriteSchema = new Schema<IFavorite>({
    user: {
        type: String,
        ref: 'User',
        required: true
    },
    products: {
        type: [String],
        ref: 'Product',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})
export default mongoose.model<IFavorite>('Favorite', favoriteSchema);