import mongoose, { Schema } from "mongoose";
import { IOrder, IOrderItem } from "../interfaces/Order";

const OrderItemSchema = new Schema<IOrderItem>({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    size: {
        type: String,
        required: true
    }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
    userId: {
        type: String,
        required: true
    },
    items: [OrderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    addressId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled', 'payment_failed'],
        default: 'pending'
    },
    paymentId: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    versionKey: false
});

export const OrderModel = mongoose.model<IOrder>('Order', OrderSchema);