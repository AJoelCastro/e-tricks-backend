import { Document, Types } from "mongoose";

export interface IOrderItem {
    productId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image:string;
    itemStatus:string;
}

export interface IOrder extends Document {
    userId: string;
    items: IOrderItem[];
    subtotalAmount: number;
    totalAmount: number;
    discountAmount: number;
    couponCode?: string;
    addressId: string;
    status: string;
    orderType:string;
    paymentId: string;
    paymentStatus: string;
    paymentMethod: string;
    deliveryStatus?:string;
    createdAt: Date;
    updatedAt: Date;
}