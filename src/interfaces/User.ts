import { Document, Types } from "mongoose";
import { ICartItem } from "./CartItem";
import { IAddress } from "./Address";

export interface IUserRequest{
    userId: string;
    favorites?: Types.ObjectId[];
    addresses?: IAddress[];
    cart?: ICartItem[]
}
export interface IUser extends Document{
    userId: string;
    favorites: Types.ObjectId[];
    addresses: IAddress[];
    cart: ICartItem[]
}