import { Document } from "mongoose";

export interface IPickUpRequest {
    city?: string;
    address?: string;
    cc?: string;
    stand?: string;
    contactNumber?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPickUp extends Document {
    city: string;
    address: string;
    cc: string;
    stand: string;
    contactNumber: string;
    createdAt: Date;
    updatedAt: Date;
}
