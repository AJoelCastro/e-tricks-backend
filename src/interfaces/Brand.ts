import { Document } from "mongoose";

export interface IBrandRequest {
    name?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IBrand extends Document {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}