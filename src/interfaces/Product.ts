import { Document, Types } from 'mongoose';
import { IResenia } from './Resenia';
export interface IStockPorTalla {
  talla: number;
  stock: number;
}
export interface IProductRequest {
    name?: string;
    description?: string;
    price?: number;
    stockPorTalla?: IStockPorTalla[]; 
    material?: Types.ObjectId
    category?: Types.ObjectId;
    images?: string[];
    descuento?: number;
    brand?: Types.ObjectId;
    isNew?: boolean;
    isTrending?: boolean;
    season?: string
}

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    stockPorTalla: IStockPorTalla[];
    material: Types.ObjectId
    category: Types.ObjectId;
    images: string[];
    descuento: number;
    brand: Types.ObjectId;
    resenias: IResenia[];
    isNewProduct: boolean;
    isTrending: boolean;
    season: string;
    createdAt: Date;
}


