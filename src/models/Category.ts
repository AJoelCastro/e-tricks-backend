import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../interfaces/Category';

const CategorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);