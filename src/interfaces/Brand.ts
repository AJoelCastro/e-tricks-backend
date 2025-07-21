import { Document } from "mongoose";

export interface IBrandRequest {
    name: string;
    updatedAt?: Date;
}
export interface IBrand extends Document {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}