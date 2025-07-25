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
        required: false,
        default: 'xxxxx'
    },
    paymentStatus: {
        type: String,
        enum: [
            'pending',          // Pago pendiente
            'approved',         // Pago aprobado
            'authorized',       // Pago autorizado pero no capturado
            'in_process',       // Pago en proceso de revisión
            'in_mediation',    // Pago en mediación
            'rejected',        // Pago rechazado
            'cancelled',       // Pago cancelado
            'refunded',        // Pago reembolsado
            'charged_back',    // Contracargo
            'partially_refunded' // Reembolso parcial
        ],
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