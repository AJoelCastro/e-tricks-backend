import { Types } from "mongoose";

export interface ICartItem {
    productId: Types.ObjectId;
    quantity: number;
    processed: boolean;
    size: number;
}