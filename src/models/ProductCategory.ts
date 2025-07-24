import mongoose, { Schema } from 'mongoose';
import { IProductCategory } from '../interfaces/ProductCategory';

const ProductCategorySchema = new Schema<IProductCategory>({
    name: {
        type: String,
        required: true
    },
    routeLink: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const ProductCategoryModel = mongoose.model<IProductCategory>('ProductCategory', ProductCategorySchema);