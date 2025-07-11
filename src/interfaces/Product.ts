import { Document } from 'mongoose';
import { IResenia } from './Resenia';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    size: string[];
    stock: number;
    category: string;
    images: string[];
    descuento: number;
    marca: string;
    resenias: IResenia[];
    createdAt: Date;
}