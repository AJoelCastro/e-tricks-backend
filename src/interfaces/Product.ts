import { Document } from 'mongoose';

export interface IResenia {
  cliente: string;
  valoracion: number;
  comentario: string;
}
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