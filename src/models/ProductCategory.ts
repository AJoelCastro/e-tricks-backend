import mongoose, { Schema } from 'mongoose';
import { IProductCategory } from '../interfaces/ProductCategory';

const CategorySchema = new Schema<IProductCategory>({
    name: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const ProductCategoryModel = mongoose.model<IProductCategory>('ProductCategory', CategorySchema);