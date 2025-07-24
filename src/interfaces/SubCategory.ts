import { Document, Types } from "mongoose";

export interface ISubCategory extends Document {
    name:string;
    productcategories: Types.ObjectId[];
    active: boolean;
    routeLink: string;
    image:string;
    createdAt: Date;
    updatedAt: Date
}

export interface ISubCategoryRequest {
    name:string;
    productcategories: string[]; 
    active?: boolean;
    routeLink: string;
    image:string;
}

export interface ISubCategoryUpdateRequest {
    name:string;
    productcategories?: string[];
    active?: boolean;
    routeLink: string;
    image:string;
}