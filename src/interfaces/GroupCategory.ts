import { Document, Types } from "mongoose";

export interface IGroupCategory extends Document {
    name:string;
    description: string;
    subcategories: Types.ObjectId[];
    active: boolean;
    brands: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IGroupCategoryRequest {
    name:string;
    description: string;
    subcategories: string[]; 
    active?: boolean;
    brands: string[]; 

}

export interface IGroupCategoryUpdateRequest {
    name:string;
    description?: string;
    subcategories?: string[];
    active?: boolean;
    brands: string[]; 
}