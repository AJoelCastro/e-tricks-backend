import { Document, Types } from "mongoose";

export interface ICategory extends Document {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICategoryRequest {
    name: string;
}

export interface ICategoryUpdateRequest {
    name?: string;
    updatedAt?: Date;
}