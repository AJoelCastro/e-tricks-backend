import { Document } from "mongoose";

export interface IBrandRequest {
    name: string;
    image: string;
    updatedAt?: Date;
}
export interface IBrand extends Document {
    name: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
}