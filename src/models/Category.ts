import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../interfaces/Category';

const CategorySchema = new Schema<ICategory>({
 
    description: {
        type: String,
        required: true
    },
});

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);