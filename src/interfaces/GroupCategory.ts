import { Document, Types } from "mongoose";

export interface IGroupCategory extends Document {
    name:string;
    description: string;
    categories: Types.ObjectId[];
    active: boolean;
    image:string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IGroupCategoryRequest {
    name:string;
    description: string;
    categories: string[]; 
    active?: boolean;
    image:string;
}

export interface IGroupCategoryUpdateRequest {
    name:string;
    description?: string;
    categories?: string[];
    active?: boolean;
    image:string;
}