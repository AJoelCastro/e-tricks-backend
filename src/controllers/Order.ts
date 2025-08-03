import { CouponRepository } from './../repositories/Coupon';
import { OrderRepository } from './../repositories/Order';
import { Request, Response } from "express";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { OrderModel } from "../models/Order";
import { IOrderMetadata ,IPaymentData} from '../interfaces/Order';
import { UserRepository } from "../repositories/User";
import { ProductModel } from '../models/Product';
import { MessageRepository } from '../repositories/Message';
const messageRepo = new MessageRepository();
const userRepository = new UserRepository();
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

const generateOrderNumber = async (): Promise<string> => {
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
        const date = new Date();
        const ymd = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        const random = Math.floor(Math.random() * 1e7).toString().padStart(7, '0');
        const generated = `${ymd}${random}`;

        // Verificar que no exista ya
        const exists = await OrderModel.findOne({ orderNumber: generated });
        if (!exists) {
            return generated;
        }
        attempts++;
    }

    throw new Error('No se pudo generar un número de orden único');
};

export const createPreference = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, couponCode, addressId, orderType } = req.body;

        // Validar usuario y carrito
        const user = await userRepository.getUserWithCart(userId);
        if (!user?.cart?.length) {
            res.status(400).json({
                success: false,
                message: 'El carrito está vacío'
            });
            return;
        }

        // Procesar items para MercadoPago (validar stock aquí)
        let subtotalAmount = 0;
        const items: any[] = [];

        for (const item of user.cart) {
            const product = await ProductModel.findById(item.productId);
            if (!product) {
                throw new Error(`Producto con ID ${item.productId} no encontrado`);
            }

            // VALIDAR STOCK DISPONIBLE
            /*    const tallaEncontrada = product.stockPorTalla?.find(
                    (s) => s.talla === item.size
                );
    
                if (!tallaEncontrada || tallaEncontrada.stock < item.quantity) {
                    res.status(400).json({
                        success: false,
                        message: `Stock insuficiente para ${product.name} en talla ${item.size}`
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
        }

        // Aplicar cupón para mostrar el precio correcto en MercadoPago
        let finalTotal = subtotalAmount;
        if (couponCode) {
            const coupon = await couponRepository.findValidCoupon(couponCode);
            if (coupon) {
                const discountAmount = subtotalAmount * (coupon.discountPercentage / 100);
                finalTotal = subtotalAmount - discountAmount;

                items.push({
                    title: `Descuento (${coupon.code}) - ${coupon.discountPercentage}%`,
                    quantity: 1,
                    unit_price: -Number(discountAmount.toFixed(2)),
                    currency_id: 'PEN'
                });
            }
        }

        const orderNumber = await generateOrderNumber();

        // 🔒 METADATA MÍNIMA Y SEGURA (solo IDs y referencias)
        const secureMetadata = {
            orderNumber: orderNumber,
            userId: userId,
            addressId: addressId,
            orderType: orderType,
            couponCode: couponCode || null,
            timestamp: Date.now(),
        };

        const body = {
            items,
            back_urls: {
                success: `${process.env.FRONTEND_URL}/order/success?oNum=${orderNumber}`,
                failure: `${process.env.FRONTEND_URL}/order/failure?oNum=${orderNumber}`,
                pending: `${process.env.FRONTEND_URL}/order/pending?oNum=${orderNumber}`
            },
            auto_return: "approved",
            external_reference: orderNumber,
            notification_url: `${process.env.BACKEND_URL}/order/webhook`,
            statement_descriptor: "TRICKS",
            expires: true,
            expiration_date_from: new Date().toISOString(),
            expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            metadata: secureMetadata,
            payment_methods: {
                excluded_payment_methods: [
                    { id: "ticket" },
                    { id: "atm" }
                ],
                excluded_payment_types: [],
                installments: 1
            }

        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        console.log("preference", preference)
        res.json({
            success: true,
            data: {
                preferenceId: result.id,
                init_point: result.init_point,
                sandbox_init_point: result.sandbox_init_point
            }
        });

    } catch (error: any) {
        console.error("❌ Error al crear preferencia:", error);
        res.status(500).json({
            success: false,
            message: "Error al crear la preferencia de pago"
        });
    }
};

// ==========================================
// 2. WEBHOOK CON RECÁLCULO COMPLETO Y SEGURO
// ==========================================

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { topic, id } = req.query;

        // Log webhook received
        await messageRepo.createMessage({
            message: `Webhook received - topic: ${topic}, id: ${id}`
        });

        if (topic === 'payment') {
            const paymentResponse = await payment.get({ id: id as string });
            const paymentData = paymentResponse;

            const orderNumber = paymentData.external_reference;
            if (!orderNumber) {
                const errorMessage = 'OrderNumber no encontrado en el webhook de pago';
                await messageRepo.createMessage({
                    message: errorMessage,
                    fullError: { paymentData }
                });
                res.status(400).json({ success: false, message: errorMessage });
                return;
            }

            // Log payment metadata
            await messageRepo.createMessage({
                message: `Payment metadata received for order ${orderNumber}`,
                fullError: { metadata: paymentData.metadata }
            });

            // Verificar idempotencia
            const existingOrder = await OrderModel.findOne({ orderNumber });
            if (existingOrder) {
                await messageRepo.createMessage({
                    message: `Orden ya procesada anteriormente: ${orderNumber}`
                });
                res.status(200).json({ success: true, message: 'Orden ya procesada' });
                return;
            }

            if (paymentData.status === 'approved') {
                const metadata = paymentData.metadata;
                if (!metadata) {
                    const errorMessage = 'Metadata no encontrada en el pago aprobado';
                    await messageRepo.createMessage({
                        message: errorMessage,
                        fullError: { paymentData }
                    });
                    throw new Error(errorMessage);
                }
                // Add detailed metadata logging
                await messageRepo.createMessage({
                    message: 'Metadata received from payment',
                    fullError: {
                        metadata: metadata,
                        metadataType: typeof metadata,
                        rawMetadata: JSON.stringify(metadata)
                    }
                });

                // Verify critical metadata fields exist
                if (!metadata.userId || !metadata.orderNumber) {
                    const errorMessage = `Metadata incompleta. Faltan campos requeridos: ${JSON.stringify(metadata)}`;
                    await messageRepo.createMessage({
                        message: errorMessage,
                        fullError: { metadata }
                    });
                    throw new Error(errorMessage);
                }


                /*  const user = await userRepository.getUserWithCart(paymentData.metadata);
                   await messageRepo.createMessage({
                  message: `USER' ${user},userId ${userId}`
                  }); */

                await createOrderFromMetadata(paymentData, metadata);
                await messageRepo.createMessage({
                    message: `✅ Orden creada con recálculo seguro: ${orderNumber}`
                });
            }
        }

        res.status(200).json({ success: true });

    } catch (error) {
        const errorMessage = `Error en webhook: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMessage, error);

        await messageRepo.createMessage({
            message: errorMessage,
            fullError: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : error
        });

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al procesar el webhook'
        });
    }
};

// ==========================================
// 3. CREAR ORDEN CON RECÁLCULO COMPLETO
// ==========================================

const createOrderFromMetadata = async (paymentData: any, metadata: IOrderMetadata) => {
    try {
        const { userId, addressId, orderType, couponCode, orderNumber } = metadata;

        console.log(`🔄 Recalculando orden desde carrito actual: ${orderNumber}`);

        // 1. OBTENER CARRITO ACTUAL DEL USUARIO
        const user = await userRepository.getUserWithCart(userId);
        await messageRepo.createMessage({
            message: `USER' ${user},userId ${userId},  ${user?.cart?.length},  orderType ${ orderType},  orderNumber ${ orderNumber}`
        });

        if (!user?.cart?.length) {
            throw new Error('Carrito vacío al procesar pago');
        }

        // 2. RECALCULAR TODO DESDE CERO (DATOS FRESCOS)
        let subtotalAmount = 0;
        const orderItems: any[] = [];

        for (const item of user.cart) {
            const product = await ProductModel.findById(item.productId);
            if (!product) {
                throw new Error(`Producto ${item.productId} no encontrado`);
            }

            // 🔒 VALIDAR STOCK NUEVAMENTE (seguridad extra)
            /*  const tallaEncontrada = product.stockPorTalla?.find(
                  (s) => s.talla === item.size
              );
  
              if (!tallaEncontrada || tallaEncontrada.stock < item.quantity) {
                  throw new Error(`Stock insuficiente: ${product.name} talla ${item.size}`); 
              } */

            // 🔒 RECALCULAR PRECIOS (precios actuales de BD)
            const currentPrice = product.price;
            const currentDiscount = product.descuento || 0;
            const discountedPrice = currentPrice * (1 - currentDiscount / 100);
            const itemTotal = discountedPrice * item.quantity;

            subtotalAmount += itemTotal;

            orderItems.push({
                productId: product._id,
                name: product.name,
                price: currentPrice, // 👈 Precio actual, no el de la preferencia
                quantity: item.quantity,
                size: item.size,
                image: product.images[0],
                itemStatus: 'pending'
            });
        }

        // 3. RECALCULAR CUPÓN (validar que siga vigente)
        let finalTotal = subtotalAmount;
        let discountAmount = 0;
        let validCoupon = null;

        if (couponCode) {
            validCoupon = await couponRepository.findValidCoupon(couponCode);
            if (validCoupon) {
                discountAmount = subtotalAmount * (validCoupon.discountPercentage / 100);
                finalTotal = subtotalAmount - discountAmount;
                console.log(`🎫 Cupón aplicado: ${couponCode} - ${discountAmount.toFixed(2)}`);
            } else {
                console.warn(`⚠️ Cupón no válido al crear orden: ${couponCode}`);
            }
        }

        // 4. VALIDAR QUE EL MONTO PAGADO COINCIDA 
        const paidAmount = paymentData.transaction_amount;
        const expectedAmount = finalTotal;

        if (Math.abs(paidAmount - expectedAmount) > 0.01) { // Tolerancia de 1 centavo
            throw new Error(
                `Monto pagado (${paidAmount}) no coincide con total esperado (${expectedAmount}). Volver a generar`
            );
        }

        console.log(`✅ Validación de monto: Pagado=${paidAmount}, Esperado=${expectedAmount}`);

        // 5. CREAR LA ORDEN CON DATOS RECALCULADOS
        const orderData = {
            userId,
            orderNumber,
            items: orderItems,
            totalAmount: finalTotal,
            subtotalAmount: subtotalAmount,
            discountAmount: discountAmount,
            couponCode: validCoupon?.code,
            addressId,
            status: 'processing',
            orderType,
            paymentId: paymentData.id.toString(),
            paymentStatus: paymentData.status,
            paymentMethod: 'mercado_pago',
            preferenceId: paymentData.preference_id,
            paymentDetails: {
                status_detail: paymentData.status_detail,
                transaction_amount: paymentData.transaction_amount,
                currency_id: paymentData.currency_id,
                payment_method_id: paymentData.payment_method_id,
                payment_type_id: paymentData.payment_type_id,
                processed_at: new Date()
            },
            confirmedAt: new Date(),
            metadata: {
                stockReserved: true,
                stockConfirmed: true,
                paymentConfirmed: true,
                reservedAt: new Date(),
                confirmedAt: new Date()
            },

        };

        // 6. GUARDAR ORDEN
        const savedOrder = await orderRepository.createOrder(orderData);
        console.log(`💾 Orden guardada: ${savedOrder._id}`);

        // 7. ACTUALIZAR STOCK
        for (const item of orderItems) {
            await ProductModel.findByIdAndUpdate(
                item.productId,
                {
                    $inc: {
                        stock: -item.quantity,
                        soldStock: item.quantity
                    }
                }
            );
        }
        console.log(`📦 Stock actualizado`);

        // 8. MARCAR CUPÓN COMO USADO
        if (validCoupon) {
            await couponRepository.markCouponAsUsed(validCoupon.code, userId);
            console.log(`🎫 Cupón marcado como usado: ${validCoupon.code}`);
        }

        // 9. LIMPIAR CARRITO
        await userRepository.clearUserCart(userId);
        console.log(`🧹 Carrito limpiado`);

        return savedOrder;

    } catch (error) {
        console.error('❌ Error creando orden desde metadata:', error);

        throw error;
    }
};
// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

const handleApprovedPayment = async (order: any) => {
    try {
        console.log(`Procesando pago aprobado para orden: ${order._id}`);

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
            console.log(`Cupón marcado como usado: ${order.couponCode}`);
        }

        // 3. Limpiar carrito del usuario
        await userRepository.clearUserCart(order.userId.toString());
        console.log(`Carrito limpiado para usuario: ${order.userId}`);

        // 4. Actualizar estado final
        await OrderModel.findByIdAndUpdate(order._id, {
            status: 'processing', // Cambiar de 'pending' a 'processing'
            confirmedAt: new Date()
        });

        console.log(`Pago procesado exitosamente para orden: ${order._id}`);

    } catch (error) {
        console.error('Error procesando pago aprobado:', error);
    }
};

const handleRejectedPayment = async (order: any) => {
    try {
        console.log(`Procesando pago rechazado para orden: ${order._id}`);

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

        console.log(`OStock liberado para orden rechazada: ${order._id}`);

    } catch (error) {
        console.error('Error procesando pago rechazado:', error);
    }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, addressId, couponCode, paymentData, userEmail } = req.body;

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

export const requestItemRefund = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId, itemId } = req.params;
        const { reason } = req.body;

        // Validar parámetros
        if (!orderId || !itemId) {
            res.status(400).json({
                success: false,
                message: 'ID de orden e ID de item son requeridos'
            });
            return;
        }

        // Solicitar reembolso
        const updatedOrder = await orderRepository.requestRefund(orderId, itemId);

        if (!updatedOrder) {
            res.status(404).json({
                success: false,
                message: 'No se pudo procesar la solicitud de reembolso'
            });
            return;
        }

        // Encontrar el item actualizado
        const updatedItem = updatedOrder.items.find(
            item => item._id === itemId
        );


        res.json({
            success: true,
            message: 'Solicitud de reembolso enviada correctamente',
            data: {
                orderId: updatedOrder._id,
                itemId: itemId,
                itemStatus: updatedItem?.itemStatus,
                reason: reason || null,
                requestedAt: new Date()
            }
        });

    } catch (error: any) {
        console.error(" Error al solicitar reembolso:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getRefundableItems = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            res.status(400).json({
                success: false,
                message: 'ID de orden es requerido'
            });
            return;
        }

        const orderWithRefundableItems = await orderRepository.getRefundableItems(orderId);

        res.json({
            success: true,
            data: orderWithRefundableItems,
            refundableCount: orderWithRefundableItems.items.length
        });

    } catch (error: any) {
        console.error(" Error al obtener items reembolsables:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Error interno del servidor"
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