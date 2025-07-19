import { Document, Types } from "mongoose";

export interface IOrderItem {
    productId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    size: string;
}

export interface IOrder extends Document {
    userId: string;
    items: IOrderItem[];
    totalAmount: number;
    addressId: string;
    status: string;
    paymentId: string;
    paymentStatus: boolean;
    paymentMethod: string;
    createdAt?: Date;
    updatedAt?: Date;
}