import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../interfaces/Product';

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    size: {
        type: [String],
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IProduct>('Product', productSchema);