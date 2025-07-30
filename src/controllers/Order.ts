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

export const createPreference = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, couponCode,addressId,  orderType } = req.body;

        // 1. VALIDAR QUE EL USUARIO EXISTA Y TENGA ITEMS EN EL CARRITO
        const user = await userRepository.getUserWithCart(userId);
        if (!user?.cart?.length) {
            res.status(400).json({
                success: false,
                message: 'El carrito está vacío'
            });
            return;
        }

        // 2. PROCESAR ITEMS DEL CARRITO Y CREAR ORDEN
        let subtotalAmount = 0;
        const items: any[] = [];
        const orderItems: any[] = [];

        for (const item of user.cart) {
            const product = await ProductModel.findById(item.productId);
            if (!product) {
                throw new Error(`Producto con ID ${item.productId} no encontrado`);
            }

            // Verificar stock disponible antes de crear la orden
         /*   const tallaEncontrada = product.stockPorTalla.find(
                (s) => s.talla === item.size
            );

            if (!tallaEncontrada || tallaEncontrada.stock < item.quantity) {
                res.status(400).json({
                    success: false,
                    message: `Stock insuficiente para ${product.name} en talla ${item.size}. Disponible: ${tallaEncontrada?.stock || 0}, Solicitado: ${item.quantity}`
                });
                return;
            } */

            const discountedPrice = product.price * (1 - (product.descuento || 0) / 100);
            const itemTotal = discountedPrice * item.quantity;
            subtotalAmount += itemTotal;

            // Para MercadoPago
            items.push({
                id: product.id,
                title: `${product.name} - Talla: ${item.size}`,
                category_id: product.category,
                description: product.description,
                quantity: item.quantity,
                unit_price: Number(discountedPrice),
                currency_id: "PEN"
            });

            // Para la orden
            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                size: item.size,
                image: product.images[0],
                itemStatus: 'pending'
            });
        }

        // 3. CREAR LA ORDEN PRIMERO
        let orderData: any = {
            userId,
            items: orderItems,
            totalAmount: subtotalAmount,
            addressId: addressId, // Se actualizará desde el frontend
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'mercado_pago',
            orderType:  orderType,
            createdAt: new Date()
        };

        // 4. APLICAR CUPÓN SI EXISTE
        let finalTotal = subtotalAmount;
        if (couponCode) {
            const coupon = await couponRepository.findValidCoupon(couponCode);
            if (coupon) {
                const discountAmount = subtotalAmount * (coupon.discountPercentage / 100);
                finalTotal = subtotalAmount - discountAmount;

                orderData.discountAmount = discountAmount;
                orderData.couponCode = coupon.code;
                orderData.totalAmount = finalTotal;

                // Agregar item de descuento para MercadoPago
                items.push({
                    title: `Descuento (${coupon.code}) - ${coupon.discountPercentage}%`,
                    quantity: 1,
                    unit_price: -Number(discountAmount.toFixed(2)),
                    currency_id: 'PEN'
                });
            }
        }

        // 5. GUARDAR LA ORDEN EN BD
        const savedOrder = await orderRepository.createOrder(orderData);
        console.log('✅ Orden creada:', savedOrder._id);

        // 6. RESERVAR STOCK (IMPORTANTE)
        for (const item of user.cart) {
            await ProductModel.findByIdAndUpdate(
                item.productId,
                {
                    $inc: {
                        stock: -item.quantity,
                        reservedStock: item.quantity
                    }
                }
            );
        }
        console.log('📦 Stock reservado para orden:', savedOrder._id);

        // 7. CREAR PREFERENCIA DE MERCADOPAGO
        const body = {
            items,
        /*    back_urls: {
                success: `${process.env.FRONTEND_URL}/order/success?orderId=${savedOrder._id}`,
                failure: `${process.env.FRONTEND_URL}/order/failure?orderId=${savedOrder._id}`,
                pending: `${process.env.FRONTEND_URL}/order/pending?orderId=${savedOrder._id}`
            },  */
        //    auto_return: "approved",
            external_reference: savedOrder._id, 
         //   notification_url: `${process.env.BACKEND_URL}/order/webhook`,
            statement_descriptor: "TRICKS",
            expires: false,
            binary_mode: false,
            metadata: {
                order_id: savedOrder._id,
                user_id: userId,
                coupon_code: couponCode || null,
                total_items: user.cart.length,
                subtotal: subtotalAmount.toFixed(2),
                final_total: finalTotal.toFixed(2),
                created_at: new Date().toISOString()
            },
            payment_methods: {
                excluded_payment_methods: [
                    { id: "ticket" },
                    { id: "atm" }
                ],
                excluded_payment_types: [],
                installments: 1
            }
        };

        console.log('Creating preference with body:', JSON.stringify(body, null, 2));

        const preference = new Preference(client);
        const result = await preference.create({ body });

        // 8. ACTUALIZAR ORDEN CON PREFERENCE ID
        await OrderModel.findByIdAndUpdate(savedOrder._id, {
            preferenceId: result.id,
            preferenceCreatedAt: new Date()
        });

        console.log('✅ Preferencia creada:', result.id);

        res.json({
            success: true,
            data: {
                orderId: savedOrder._id,
                preferenceId: result.id,
                init_point: result.init_point,
                sandbox_init_point: result.sandbox_init_point
            }
        });

    } catch (error: any) {
        console.error("❌ Error al crear preferencia:", error);

        // En caso de error, liberar cualquier stock que se haya reservado
        // (implementar rollback si es necesario)

        res.status(500).json({
            success: false,
            message: "Error al crear la preferencia de pago",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==========================================
// WEBHOOK MODIFICADO PARA USAR orderId
// ==========================================

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('🔔 Webhook recibido:', {
            query: req.query,
            body: req.body
        });

        const { topic, id } = req.query;

        if (topic === 'payment') {
            console.log('💳 Procesando notificación de pago:', id);

            const paymentResponse = await payment.get({
                id: id as string
            });

            const paymentData = paymentResponse;

            if (!paymentData.id) {
                console.error('❌ ID de pago no encontrado en la respuesta');
                res.status(400).json({
                    success: false,
                    message: 'ID de pago no válido'
                });
                return;
            }

            // 👈 CLAVE: Buscar orden por external_reference (orderId)
            const orderId = paymentData.external_reference;
            if (!orderId) {
                console.error('❌ No se encontró external_reference (orderId) en el pago');
                res.status(400).json({
                    success: false,
                    message: 'OrderId no encontrado en external_reference'
                });
                return;
            }

            console.log(`🔍 Buscando orden con ID: ${orderId}`);

            // Buscar la orden por su ID
            const existingOrder = await OrderModel.findById(orderId);
            if (!existingOrder) {
                console.error(`❌ Orden no encontrada: ${orderId}`);
                res.status(404).json({
                    success: false,
                    message: 'Orden no encontrada'
                });
                return;
            }

            // Verificar si ya se procesó este pago (idempotencia)
            if (existingOrder.paymentId === paymentData.id.toString()) {
                console.log(`⚠️ Pago ya procesado para orden ${orderId}`);
                res.status(200).json({
                    success: true,
                    message: 'Pago ya procesado anteriormente'
                });
                return;
            }

            // Actualizar la orden con información del pago
            const updatedOrder = await OrderModel.findByIdAndUpdate(
                orderId,
                {
                    paymentId: paymentData.id.toString(),
                    paymentStatus: paymentData.status,
                    status: mapPaymentStatus(paymentData.status!),
                    paymentDetails: {
                        status_detail: paymentData.status_detail,
                        transaction_amount: paymentData.transaction_amount,
                        currency_id: paymentData.currency_id,
                        payment_method_id: paymentData.payment_method_id,
                        processed_at: new Date()
                    },
                    updatedAt: new Date()
                },
                { new: true }
            );

            console.log(`✅ Orden actualizada: ${orderId} - Estado: ${paymentData.status}`);

            // Acciones según el estado del pago
            if (paymentData.status === 'approved') {
                await handleApprovedPayment(updatedOrder!);
            } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
                await handleRejectedPayment(updatedOrder!);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Webhook procesado correctamente'
        });

    } catch (error) {
        console.error('❌ Error en webhook:', error);
        res.status(200).json({ // Siempre responder 200 a MercadoPago
            success: false,
            message: 'Error procesando webhook'
        });
    }
};

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

const handleApprovedPayment = async (order: any) => {
    try {
        console.log(`✅ Procesando pago aprobado para orden: ${order._id}`);

        // 1. Confirmar stock (de reservado a vendido)
        for (const item of order.items) {
            await ProductModel.findByIdAndUpdate(
                item.productId,
                {
                    $inc: {
                        reservedStock: -item.quantity,
                        soldStock: item.quantity
                    }
                }
            );
        }

        // 2. Marcar cupón como usado
        if (order.couponCode) {
            await couponRepository.markCouponAsUsed(order.couponCode, order.userId);
            console.log(`🎫 Cupón marcado como usado: ${order.couponCode}`);
        }

        // 3. Limpiar carrito del usuario
        await userRepository.clearUserCart(order.userId.toString());
        console.log(`🛒 Carrito limpiado para usuario: ${order.userId}`);

        // 4. Actualizar estado final
        await OrderModel.findByIdAndUpdate(order._id, {
            status: 'processing', // Cambiar de 'pending' a 'processing'
            confirmedAt: new Date()
        });

        console.log(`🎉 Pago procesado exitosamente para orden: ${order._id}`);

    } catch (error) {
        console.error('❌ Error procesando pago aprobado:', error);
    }
};

const handleRejectedPayment = async (order: any) => {
    try {
        console.log(`❌ Procesando pago rechazado para orden: ${order._id}`);

        // 1. Liberar stock reservado
        for (const item of order.items) {
            await ProductModel.findByIdAndUpdate(
                item.productId,
                {
                    $inc: {
                        stock: item.quantity,
                        reservedStock: -item.quantity
                    }
                }
            );
        }

        // 2. Actualizar estado
        await OrderModel.findByIdAndUpdate(order._id, {
            status: 'payment_failed',
            failedAt: new Date()
        });

        console.log(`📦 Stock liberado para orden rechazada: ${order._id}`);

    } catch (error) {
        console.error('❌ Error procesando pago rechazado:', error);
    }
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
                    size: item.size,
                    image: product.images[0]
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

        res.json({ success: true, data: orders });
    } catch (error) {
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