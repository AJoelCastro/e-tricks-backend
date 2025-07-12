import { Types } from "mongoose";

export interface ICartItem {
    productId: Types.ObjectId;
    quantity: number;
    size: string;
}