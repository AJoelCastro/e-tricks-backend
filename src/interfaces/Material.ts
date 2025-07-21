import { Document } from "mongoose";

export interface IMaterialRequest{
    name?: string
}

export interface IMaterial extends Document {
    name: string;
    createdAt: Date;
}