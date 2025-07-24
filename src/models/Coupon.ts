import mongoose, { Schema } from "mongoose";
import { ICoupon } from "../interfaces/Coupon";

const CouponSchema = new Schema<ICoupon>({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    validUntil: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    usedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    usedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    versionKey: false
});

export const CouponModel = mongoose.model<ICoupon>('Coupon', CouponSchema);