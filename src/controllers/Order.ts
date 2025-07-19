import { Request, Response } from "express";
import Stripe from 'stripe';
import { OrderRepository } from "../repositories/Order";
import { UserRepository } from "../repositories/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {

});

const orderRepository = new OrderRepository();
const userRepository = new UserRepository();

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { userId, addressId } = req.body;

        if (!userId || !addressId) {
            return res.status(400).json({ 
                success: false,
                message: 'Se requieren userId y addressId' 
            });
        }

        const user = await userRepository.getUserWithCart(userId);
        if (!user || !user.cart || user.cart.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'El carrito está vacío' 
            });
        }

        let totalAmount = 0;
        const orderItems = user.cart.map((item: any) => {
            const itemTotal = item.productId.price * item.quantity;
            totalAmount += itemTotal;
            
            return {
                productId: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                quantity: item.quantity,
                size: item.size
            };
        });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'pen',
            metadata: { userId, addressId }
        });

        const orderData = {
            userId,
            items: orderItems,
            totalAmount,
            addressId,
            paymentId: paymentIntent.id,
            paymentStatus: false, 
            paymentMethod: 'card',
            status: 'pending'
        };

        const order = await orderRepository.createOrder(orderData);

        return res.status(200).json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                orderId: order._id,
                totalAmount,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });

    } catch (error) {
        console.error('Error al crear orden:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error al crear orden',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const confirmOrderPayment = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ 
                success: false,
                message: 'orderId es requerido' 
            });
        }

        const updatedOrder = await orderRepository.updateOrder(orderId, {
            paymentStatus: true,
            status: 'processing'
        });

        if (!updatedOrder) {
            return res.status(404).json({ 
                success: false,
                message: 'Orden no encontrada' 
            });
        }

        await userRepository.clearUserCart(updatedOrder.userId);

        return res.status(200).json({
            success: true,
            data: updatedOrder
        });

    } catch (error) {
        console.error('Error al confirmar orden:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error al confirmar orden',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        const order = await orderRepository.getOrderById(orderId);
        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Orden no encontrada' 
            });
        }

        return res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Error al obtener orden:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error al obtener orden',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const getUserOrders = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const orders = await orderRepository.getOrdersByUser(userId);
        return res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error al obtener órdenes',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;

        const updatedOrder = await orderRepository.cancelOrder(orderId);
        if (!updatedOrder) {
            return res.status(404).json({ 
                success: false,
                message: 'Orden no encontrada' 
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedOrder
        });

    } catch (error) {
        console.error('Error al cancelar orden:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error al cancelar orden',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const handleOrderWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Error en webhook:', err);
        return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const { userId } = paymentIntent.metadata;

                await orderRepository.updateOrderByPaymentId(paymentIntent.id, {
                    paymentStatus: true,
                    status: 'processing'
                });

                await userRepository.clearUserCart(userId);
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                await orderRepository.updateOrderByPaymentId(failedPayment.id, {
                    status: 'payment_failed'
                });
                break;

            default:
                console.log(`Evento no manejado: ${event.type}`);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Error procesando webhook:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error procesando webhook',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};