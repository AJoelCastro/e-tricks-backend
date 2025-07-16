import { Document } from "mongoose";
import { ICartItem } from "./CartItem";

export interface IOrder extends Document{
    userId: string;
    items: ICartItem[];
    totalAmount: number;
    orderDate: Date;
    status: string;
    paymentId: string;
    paymentStatus: boolean;
    paymentMethod: string;
}