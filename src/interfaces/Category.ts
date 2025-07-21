import { Document, Types } from "mongoose";

export interface ICategory {
    description: string;
}

export interface ICategoryRequest {
    description: string;
}

export interface ICategoryUpdateRequest {
    description?: string;
}