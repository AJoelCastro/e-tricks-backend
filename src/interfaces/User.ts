import { Document, Types } from "mongoose";
import { ICartItem } from "./CartItem";
import { IAddress } from "./Address";
import { ICard } from "./Card";
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
    billing?: {
      customer_id: string;
      cards: ICard[];
    };
    personalInfo:{
      name?:string,
      lastname?:string,
      document:{
        type:string,
        number:string
      }
    }
}