import { Document, Types } from "mongoose";

export interface ICoupon extends Document {
    code: string;
    discountPercentage: number;
    validUntil: Date;
    used: boolean;
    usedBy?: Types.ObjectId | string; 
    usedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}