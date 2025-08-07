import { OrderModel } from "../models/Order";
import { IOrder, IOrderCreate } from "../interfaces/Order";
import { CouponRepository } from "./Coupon";
import { on } from "events";

export class OrderRepository {
    private couponRepository: CouponRepository;

    constructor() {
        this.couponRepository = new CouponRepository();
    }

    async createOrder(orderData: IOrderCreate  ) {
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

    async getOrderByNumber(oNumber: string) {
        try {
            return await OrderModel.find({orderNumber:oNumber})
                .populate('items.productId')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async getAllOrderDetails() {
        try {
            return await OrderModel.find()
                .populate('items.productId')
                .sort({ createdAt: -1 })
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async getOrdersByUser(userId: string) {
        try {
            return await OrderModel.find({ userId: userId })
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

    async requestRefund(orderId: string, itemId: string) {
        try {
            // Buscar la orden y verificar que existe
            const order = await OrderModel.findById(orderId);
            if (!order) {
                throw new Error('Orden no encontrada');
            }

            // Verificar que el item existe en la orden
            const item = order.items.find(item => item._id.toString() === itemId);

            if (!item) {
                // Mensaje más descriptivo que incluye información útil
                throw new Error(`Ítem no encontrado en la orden. `);
            }

            // Verificar que el item puede ser reembolsado

            const validStatusForRefund = ['delivered', 'shipped'];
            if (!validStatusForRefund.includes(item.itemStatus)) {
                throw new Error(`No se puede solicitar reembolso para el ítem "${item.name}". `);
            }

            // Actualizar el estado del item específico
            const result = await OrderModel.findOneAndUpdate(
                {
                    _id: orderId,
                    'items._id': itemId
                },
                {
                    $set: {
                        'items.$.itemStatus': 'return_requested',
                        updatedAt: new Date()
                    }
                },
                { new: true }
            ).populate('items.productId').exec();

            return result;
        } catch (error) {
            throw error;
        }
    }

    // MÉTODO ADICIONAL PARA OBTENER ITEMS ELEGIBLES PARA REEMBOLSO
    async getRefundableItems(orderId: string) {
        try {
            const order = await OrderModel.findById(orderId)
                .populate('items.productId')
                .exec();

            if (!order) {
                throw new Error('Orden no encontrada');
            }

            // Filtrar items que pueden ser reembolsados
            const refundableItems = order.items.filter(item =>
                ['delivered', 'shipped'].includes(item.itemStatus)
            );

            return {
                ...order.toObject(),
                items: refundableItems
            };
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