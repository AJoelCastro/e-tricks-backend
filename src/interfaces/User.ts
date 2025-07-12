import { Document, Types } from "mongoose";
import { ICartItem } from "./CartItem";

export interface IUserRequest{
    idClerk?: string;
    favorites?: Types.ObjectId[];
    cart?: ICartItem[]
}
export interface IUser extends Document{
    idClerk: string;
    favorites: Types.ObjectId[];
    cart: ICartItem[]
}