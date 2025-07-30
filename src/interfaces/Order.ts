import { Document, Types } from "mongoose";

export interface IOrderItem {
    productId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    size: number;
    image:string;
    itemStatus:string;
}

export interface IPaymentDetails {
  status_detail?: string;
  transaction_amount?: number;
  currency_id?: string;
  payment_method_id?: string;
  payment_type_id?: string;
  processed_at?: Date;
}

export interface IMetadata {
  stockReserved?: boolean;
  reservedAt?: Date;
  stockConfirmed?: boolean;
  confirmedAt?: Date;
  paymentConfirmed?: boolean;
}


export interface IOrder extends Document {
    _id:string;
    userId: string;
    orderNumber:string;
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
    preferenceId?: string;
    preferenceCreatedAt?: Date;
    paymentDetails?: IPaymentDetails;
    confirmedAt?: Date;
    failedAt?: Date;
    deliveryStatus?:string;
    metadata?: IMetadata;
    createdAt: Date;
    updatedAt: Date;
}