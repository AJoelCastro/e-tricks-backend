import { Document, ObjectId, Types } from "mongoose";
import { ICartItem } from "./CartItem";

export interface IUser extends Document{
    idClerk: string;
    favorites: Types.ObjectId[];
    cart: ICartItem[]
}