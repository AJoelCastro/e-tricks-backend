import { Document, ObjectId } from "mongoose";

export interface IFavorite extends Document {
    user: string;
    products: string[];
    createdAt: Date;
    updatedAt: Date;
}