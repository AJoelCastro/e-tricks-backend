import { Document, Types } from "mongoose";

export interface IOrderItem {
    productId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    size: string;
}

export interface IOrder extends Document {
    userId: string;
    items: IOrderItem[];
    subtotalAmount: number;
    totalAmount: number;
    discountAmount: number;
    couponCode?: string;
    addressId: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'payment_failed' | 'rejected' | 'refunded';
    paymentId: string;
    paymentStatus: string;
    paymentMethod: string;
    mercadoPagoPreferenceId?: string;
    mercadoPagoMerchantOrderId?: string;
    createdAt: Date;
    updatedAt: Date;
}