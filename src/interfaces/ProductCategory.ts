import { Document, Types } from "mongoose";

export interface IProductCategory extends Document {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProductCategoryRequest {
    name: string;
    updatedAt?: Date;
}

export interface IProductCategoryUpdateRequest {
    name?: string;
    updatedAt?: Date;
}