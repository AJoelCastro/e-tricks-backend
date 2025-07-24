import { CouponModel } from "../models/Coupon";
import { ICoupon } from "../interfaces/Coupon";
import { Types } from "mongoose";

export class CouponRepository {
    async createCoupon(couponData: Omit<ICoupon, 'createdAt' | 'updatedAt' | '_id' | 'used' | 'usedBy' | 'usedAt'>) {
        try {
            const newCoupon = new CouponModel(couponData);
            return await newCoupon.save();
        } catch (error) {
            throw error;
        }
    }

    async findValidCoupon(code: string) {
        try {
            return await CouponModel.findOne({
                code: code.toUpperCase(),
                used: false,
                validUntil: { $gt: new Date() }
            }).exec();
        } catch (error) {
            throw error;
        }
    }

    async markCouponAsUsed(code: string, userId: string | Types.ObjectId) {
        try {
            return await CouponModel.findOneAndUpdate(
                { code: code.toUpperCase() },
                {
                    used: true,
                    usedBy: userId,
                    usedAt: new Date()
                },
                { new: true }
            ).exec();
        } catch (error) {
            throw error;
        }
    }

    async getCouponByCode(code: string) {
        try {
            return await CouponModel.findOne({ code: code.toUpperCase() }).exec();
        } catch (error) {
            throw error;
        }
    }

    async listCoupons(filter: Partial<ICoupon> = {}) {
        try {
            return await CouponModel.find(filter)
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            throw error;
        }
    }
}