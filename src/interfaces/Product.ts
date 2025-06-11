import { Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    size: string[];
    colors: string[];
    stock: number;
    category: string;
    images: string[];
    createdAt: Date;
}