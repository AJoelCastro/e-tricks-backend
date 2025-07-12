import { Document, Types } from 'mongoose';

export interface ICartItem {
    productId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    quantity: number;
    selectedSize: string;
    selectedColor?: string;
    category: string;
    images: string[];
}

export interface ICart extends Document {
    userId: Types.ObjectId;
    items: ICartItem[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    cart?: ICart;
    error?: string;
}

export interface AddToCartRequest {
    userId: string;
    productId: string;
    selectedSize: string;
    selectedColor?: string;
    quantity?: number;
}

export interface UpdateCartRequest {
    userId: string;
    productId: string;
    selectedSize: string;
    selectedColor?: string;
    quantity: number;
}

export interface RemoveFromCartRequest {
    userId: string;
    productId: string;
    selectedSize: string;
    selectedColor?: string;
}

export interface PaymentIntentRequest {
    userId: string;
    amount: number;
}
