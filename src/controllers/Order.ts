import { CouponRepository } from './../repositories/Coupon';
import { OrderRepository } from './../repositories/Order';
import { ProductRepository } from './../repositories/Product';
import { Request, Response } from "express";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { OrderModel } from "../models/Order";
import { UserRepository } from "../repositories/User";
import { ProductModel } from '../models/Product';

const userRepository = new UserRepository();
const productRepository = new ProductRepository();
const orderRepository = new OrderRepository();
const couponRepository = new CouponRepository();
// Configuración  de MercadoPago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    options: {
        timeout: 5000,
        idempotencyKey: 'abc'
    }
});


const payment = new Payment(client);

const mapPaymentStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        'approved': 'processing',
        'in_process': 'pending',
        'in_mediation': 'pending',
        'rejected': 'payment_failed',
        'cancelled': 'cancelled',
        'refunded': 'refunded',
        'charged_back': 'refunded',
        'pending': 'pending'
    };
    return statusMap[status] || 'pending';
};


export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, addressId, couponCode, paymentData,userEmail } = req.body;

        if (!userId || !addressId) {
            res.status(400).json({
                success: false,
                message: 'Se requieren userId y addressId'
            });
            return;
        }

        // Obtener usuario con carrito
        const user = await userRepository.getUserWithCart(userId);
        if (!user?.cart?.length) {
            res.status(400).json({
                success: false,
                message: 'El carrito está vacío'
            });
            return;
        }

        let subtotalAmount = 0;
        const orderItems = await Promise.all(
            user.cart.map(async (item) => {
                const product = await ProductModel.findById(item.productId);
                if (!product) {
                    throw new Error(`Producto con ID ${item.productId} no encontrado`);
                }

                const itemTotal = product.price * item.quantity;
                subtotalAmount += itemTotal;

                return {
                    productId: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    size: item.size
                };
            })
        );

        let orderData: any = {
            userId,
            items: orderItems,
            subtotalAmount,
            orderType: 'pickup',
            totalAmount: subtotalAmount,
            addressId,
            paymentMethod: paymentData?.paymentMethod || 'mercado_pago',
            status: 'pending',
            paymentStatus: 'pending'
        };

        // Aplicar cupón si existe
        if (couponCode) {
            const coupon = await couponRepository.findValidCoupon(couponCode);
            if (coupon) {
                const discountAmount = subtotalAmount * (coupon.discountPercentage / 100);
                orderData.totalAmount = subtotalAmount - discountAmount;
                orderData.discountAmount = discountAmount;
                orderData.couponCode = coupon.code;
            }
        }

        const savedOrder = await orderRepository.createOrder(orderData);

        // Si se proporciona información de pago, procesarla
        if (paymentData && paymentData.token) {
            try {
                // Procesar pago con MercadoPago
                const paymentRequest = {
                    transaction_amount: orderData.totalAmount,
                    token: paymentData.token,
                    description: `Orden #${savedOrder._id}`,
                    installments: paymentData.installments || 1,
                    payer: {
                        email: userEmail,
                        identification: {
                            type: paymentData.payer.identification.type,
                            number: paymentData.payer.identification.number
                        }
                    },
                    external_reference: savedOrder.userId,
                    notification_url: `${process.env.BACKEND_URL}/api/orders/webhook`,
                    statement_descriptor: 'TRICKS'
                };

                const paymentResponse = await payment.create({
                    body: paymentRequest
                });

                if (paymentResponse.id) {
                    savedOrder.paymentId = paymentResponse.id.toString();
                    savedOrder.paymentStatus = paymentResponse.status!;
                    savedOrder.status = mapPaymentStatus(paymentResponse.status!);
                    await savedOrder.save();

                    // Si el pago fue aprobado, marcar cupón como usado y limpiar carrito
                    if (paymentResponse.status === 'approved') {
                        if (savedOrder.couponCode) {
                            await couponRepository.markCouponAsUsed(savedOrder.couponCode, savedOrder.userId);
                        }
                        await userRepository.clearUserCart(savedOrder.userId.toString());
                    }
                }

                res.status(201).json({
                    success: true,
                    data: {
                        order: savedOrder,
                        payment: {
                            id: paymentResponse.id,
                            status: paymentResponse.status,
                            status_detail: paymentResponse.status_detail
                        }
                    }
                });

            } catch (paymentError) {
                console.error('Error procesando pago:', paymentError);
                res.status(201).json({
                    success: true,
                    data: {
                        order: savedOrder,
                        payment_error: 'Error procesando el pago. La orden fue creada pero el pago falló.'
                    }
                });
            }
        } else {
            // Solo crear la orden sin procesar pago
            res.status(201).json({
                success: true,
                data: {
                    order: savedOrder
                }
            });
        }

    } catch (error) {
        console.error('Error al crear orden en servidor:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear orden',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { topic, id } = req.query;

        if (topic === 'payment') {

            const paymentResponse = await payment.get({
                id: id as string
            });

            const paymentData = paymentResponse;


            if (!paymentData.id) {
                console.error('ID de pago no encontrado en la respuesta');
                res.status(400).json({
                    success: false,
                    message: 'ID de pago no válido'
                });
                return;
            }

            const updatedOrder = await OrderModel.findOneAndUpdate(
                { paymentId: paymentData.id.toString() },
                {
                    paymentStatus: paymentData.status,
                    status: mapPaymentStatus(paymentData.status!),
                    mercadoPagoMerchantOrderId: paymentData.order?.id
                },
                { new: true }
            );

            if (paymentData.status === 'approved' && updatedOrder?.couponCode) {
                await couponRepository.markCouponAsUsed(updatedOrder.couponCode, updatedOrder.userId,);

                await userRepository.clearUserCart(updatedOrder.userId.toString());
            }
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Error en webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Error procesando webhook'
        });
    }
};

export const confirmOrderPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId, paymentId } = req.body;

        if (!orderId || !paymentId) {
            res.status(400).json({ 
                success: false,
                message: 'Se requieren orderId y paymentId' 
            });
            return;
        }

        // Verificar el pago en MercadoPago
        const paymentResponse = await payment.get({ id: paymentId });
        
        if (!paymentResponse) {
            res.status(404).json({ 
                success: false,
                message: 'Pago no encontrado en MercadoPago' 
            });
            return;
        }

        // Actualizar la orden con el estado del pago
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            orderId,
            {
                paymentId: paymentResponse.id,
                paymentStatus: paymentResponse.status,
                status: mapPaymentStatus(paymentResponse.status!)
            },
            { new: true }
        );

        if (!updatedOrder) {
            res.status(404).json({ 
                success: false,
                message: 'Orden no encontrada' 
            });
            return;
        }

       
        if (paymentResponse.status === 'approved') {
            if (updatedOrder.couponCode) {
                 await couponRepository.markCouponAsUsed(updatedOrder.couponCode, updatedOrder.userId,);
            }

            await userRepository.clearUserCart(updatedOrder.userId.toString());
        }

        res.json({ 
            success: true, 
            data: updatedOrder 
        });

    } catch (error) {
        console.error('Error confirmando pago:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error confirmando pago'
        });
    }
};

export const getOrderDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await orderRepository.getOrderById(req.params.orderId.toString())

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
            return;
        }

        res.json({ success: true, data: order });

    } catch (error) {
        console.error('Error obteniendo orden:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo orden'
        });
    }
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await orderRepository.getOrdersByUser(req.params.userId)

        console.log("order controller", orders);
        res.json({ success: true, data: orders });

    } catch (error) {
        console.error('Error obteniendo órdenes:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo órdenes'
        });
    }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await orderRepository.cancelOrder(
            req.params.orderId
        );

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
            return;
        }

        res.json({ success: true, data: order });

    } catch (error) {
        console.error('Error cancelando orden:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelando orden'
        });
    }
};