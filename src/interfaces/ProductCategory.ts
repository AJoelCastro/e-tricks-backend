import { Document, Types } from "mongoose";

export interface IProductCategory extends Document {
    name: string;
    routeLink: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProductCategoryRequest {
    name: string;
    routeLink: string;
    updatedAt?: Date;
}

export interface IProductCategoryUpdateRequest {
    name?: string;
    routeLink?: string;
    updatedAt?: Date;
}