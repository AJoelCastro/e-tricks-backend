import { Document, Types } from "mongoose";

export interface IProductCategory extends Document {
    name: string;
    image: string;
    routeLink: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProductCategoryRequest {
    name: string;
    routeLink: string;
    image: string;
    updatedAt?: Date;
}

export interface IProductCategoryUpdateRequest {
    name?: string;
    image?: string;
    routeLink?: string;
    updatedAt?: Date;
}