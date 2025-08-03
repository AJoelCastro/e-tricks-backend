import { Document, Types } from "mongoose";

export interface IOrderItem {
    _id:string;
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


export interface IOrderCreate {
    userId: string;
    orderNumber: string;
    items: IOrderItem[];
    subtotalAmount: number;
    totalAmount: number;
    discountAmount: number;
    couponCode?: string;
    addressId: string;
    status: string;
    orderType: string;
    paymentId: string;
    paymentStatus: string;
    paymentMethod: string;
    preferenceId?: string;
    preferenceCreatedAt?: Date;
    paymentDetails?: IPaymentDetails;
    confirmedAt?: Date;
    failedAt?: Date;
    deliveryStatus?: string;
    metadata?: IMetadata;
}

// 2. La interfaz completa que extiende Document
export interface IOrder extends Document, IOrderCreate {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrderMetadata {
  userId: string;
  orderNumber: string;
  addressId: string;
  orderType: string;
  couponCode?: string | null;
  timestamp?: number;
}

export interface IPaymentData {
  id: string;
  status: string;
  transaction_amount: number;
  external_reference?: string;
  metadata?: IOrderMetadata;
  status_detail: string;
  currency_id: string;
  payment_method_id: string;
  payment_type_id: string;
  preference_id?: string;
}
