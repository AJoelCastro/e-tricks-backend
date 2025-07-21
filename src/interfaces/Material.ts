import { Document } from "mongoose";

export interface IMaterialRequest{
    name?: string
    description?: string
}

export interface IMaterial extends Document {
    name: string;
    description: string;
    createdAt: Date;
}