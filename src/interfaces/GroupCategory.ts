import { Document, Types } from "mongoose";

export interface IGroupCategory extends Document {
    description: string;
    categories: Types.ObjectId[];
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IGroupCategoryRequest {
    description: string;
    categories: string[]; 
    active?: boolean;
}

export interface IGroupCategoryUpdateRequest {
    description?: string;
    categories?: string[];
    active?: boolean;
}