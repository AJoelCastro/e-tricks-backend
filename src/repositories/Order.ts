import { OrderModel } from "../models/Order";
import { IOrder } from "../interfaces/Order";

export class OrderRepository {
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
            return await OrderModel.find({ userId })
                .populate('items.productId')
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
}