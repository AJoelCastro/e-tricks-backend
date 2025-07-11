import { Document } from "mongoose";

export interface ICartItem extends Document{
    productId: string;
    quantity: number;
    size: string;
}