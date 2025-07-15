import { Document, Types } from "mongoose";
import { ICartItem } from "./CartItem";

export interface IUserRequest{
    userId: string;
    favorites?: Types.ObjectId[];
    cart?: ICartItem[]
}
export interface IUser extends Document{
    userId: string;
    favorites: Types.ObjectId[];
    cart: ICartItem[]
}