import { OrderModel } from "../models/Order";
import { IOrder } from "../interfaces/Order";
import { CouponRepository } from "./Coupon";

export class OrderRepository {
    private couponRepository: CouponRepository;

    constructor() {
        this.couponRepository = new CouponRepository();
    }

    async createOrder(orderData: Omit<IOrder, 'createdAt' | 'updatedAt' | '_id'>) {
        try {
            const newOrder = new OrderModel(orderData);
            return await newOrder.save();
        } catch (error) {
            throw error;
        }
    }

    async getOrderById(orderId: string) {
        try {
            return await OrderModel.findById(orderId)
                .populate('items.productId')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async getOrdersByUser(userId: string) {
        try {
            return await OrderModel.find({ userId:userId })
                .populate('items')
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async updateOrder(orderId: string, updateData: Partial<IOrder>) {
        try {
            return await OrderModel.findByIdAndUpdate(
                orderId,
                { $set: updateData },
                { new: true }
            ).populate('items.productId').exec();
        } catch (error) {
            throw error;
        }
    }

    async updateOrderByPaymentId(paymentId: string, updateData: Partial<IOrder>) {
        try {
            return await OrderModel.findOneAndUpdate(
                { paymentId },
                { $set: updateData },
                { new: true }
            ).populate('items.productId').exec();
        } catch (error) {
            throw error;
        }
    }

    async cancelOrder(orderId: string) {
        try {
            return await this.updateOrder(orderId, { status: 'cancelled' });
        } catch (error) {
            throw error;
        }
    }

    async applyCouponToOrder(orderId: string, couponCode: string, userId: string) {
        try {
            const order = await this.getOrderById(orderId);
            if (!order) throw new Error('Orden no encontrada');

            const coupon = await this.couponRepository.findValidCoupon(couponCode);
            if (!coupon) throw new Error('Cupón no válido o expirado');

            const discountAmount = order.subtotalAmount * (coupon.discountPercentage / 100);
            const totalAmount = order.subtotalAmount - discountAmount;

            return await this.updateOrder(orderId, {
                couponCode: coupon.code,
                discountAmount,
                totalAmount
            });
        } catch (error) {
            throw error;
        }
    }

    async finalizeOrderWithCoupon(orderId: string) {
        try {
            const order = await this.getOrderById(orderId);
            if (!order || !order.couponCode) return;

            await this.couponRepository.markCouponAsUsed(order.couponCode, order.userId);
        } catch (error) {
            throw error;
        }
    }
}