import { CouponRepository } from './../repositories/Coupon';
import { OrderRepository } from './../repositories/Order';
import { Request, Response } from "express";
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { OrderModel } from "../models/Order";
import { IOrderMetadata, IPaymentData } from '../interfaces/Order';
import { UserRepository } from "../repositories/User";
import { ProductModel } from '../models/Product';
import { MessageRepository } from '../repositories/Message';
import PDFDocument from 'pdfkit';
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
export const exportOrdersPDF = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
       res.status(400).json({ error: 'Debe proporcionar startDate y endDate' });
       return;
    }
    // Convertir a fechas válidas
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Buscar órdenes dentro del rango
    const orders = await OrderModel.find({
      createdAt: { $gte: start, $lte: end }
    })
      //.populate('user', 'name email')
      .populate('items.productId', 'name price');

    // Crear PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    // Cabecera HTTP para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ordenes_${startDate}_${endDate}.pdf"`);

    doc.pipe(res);

    // Título
    doc.fontSize(18).text('Reporte de Órdenes', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Desde: ${start.toLocaleDateString()} - Hasta: ${end.toLocaleDateString()}`);
    doc.moveDown();

    if (orders.length === 0) {
      doc.text('No se encontraron órdenes en este rango de fechas.');
    } else {
      orders.forEach((order, index) => {
        doc.fontSize(12).text(`Orden #${order.orderNumber}`, { underline: true });
        doc.text(`User ID: ${order.userId}`);
        // doc.text(`Usuario: ${order.user?.name} (${order.user?.email})`);
        doc.text(`Estado: ${order.status}`);
        doc.text(`Fecha: ${new Date(order.createdAt).toLocaleString()}`);
        doc.text(`Total: S/. ${order.totalAmount}`);
        doc.moveDown();

        // Items
        order.items.forEach((item: any) => {
          doc.text(`- ${item.name} (${item.quantity} x S/.${item.price})`);
        });

        if (index !== orders.length - 1) {
          doc.moveDown().moveDown();
          doc.text('--------------------------------------------');
          doc.moveDown();
        }
      });
    }

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
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
            orderNumber, 
            userId,       
            addressId,    
            orderType,
            couponCode: couponCode || null,
            timestamp: Date.now(),
        };


        const body = {
            items,
            back_urls: {
                success: `${process.env.FRONTEND_URL}/compras`,
                failure: `${process.env.FRONTEND_URL}/carrito/pagos`,
                pending: `${process.env.FRONTEND_URL}/carrito/pagos`
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

      

        if (topic === 'payment') {
            const paymentResponse = await payment.get({ id: id as string });
            const paymentData = paymentResponse;

            const orderNumber = paymentData.external_reference;
            if (!orderNumber) {
                const errorMessage = 'OrderNumber no encontrado en el webhook de pago';
                res.status(400).json({ success: false, message: errorMessage });
                return;
            }

         

            // Verificar idempotencia
            const existingOrder = await OrderModel.findOne({ orderNumber });
            if (existingOrder) {            
                res.status(200).json({ success: true, message: 'Orden ya procesada' });
                return;
            }

            if (paymentData.status === 'approved') {
                const metadata = paymentData.metadata as IOrderMetadata;
                if (!metadata) {
                    const errorMessage = 'Metadata no encontrada en el pago aprobado';                
                    throw new Error(errorMessage);
                }
             

                // Verify critical metadata fields exist
             /*   if (!metadata || !metadata.orderNumber) {
                    const errorMessage = `Metadata incompleta. Faltan campos requeridos: ${JSON.stringify(metadata)}`;
                    await messageRepo.createMessage({
                        message: errorMessage,
                        fullError: { metadata }
                    });
                    throw new Error(errorMessage);
                } */


                /*  const user = await userRepository.getUserWithCart(paymentData.metadata);
                   await messageRepo.createMessage({
                  message: `USER' ${user},userId ${userId}`
                  }); */

                await createOrder(paymentData, metadata);            
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

const createOrder = async (paymentData: any, metadata: IOrderMetadata) => {
    try {
        const { user_id, order_number, address_id, order_type, coupon_code } = metadata;


        // 1. OBTENER CARRITO ACTUAL DEL USUARIO
        const user = await userRepository.getUserWithCart(user_id);
      

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

        if (coupon_code) {
            validCoupon = await couponRepository.findValidCoupon(coupon_code);
            if (validCoupon) {
                discountAmount = subtotalAmount * (validCoupon.discountPercentage / 100);
                finalTotal = subtotalAmount - discountAmount;
                console.log(`🎫 Cupón aplicado: ${coupon_code} - ${discountAmount.toFixed(2)}`);
            } else {
                console.warn(`⚠️ Cupón no válido al crear orden: ${coupon_code}`);
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


        // 5. CREAR LA ORDEN CON DATOS RECALCULADOS
        const orderData = {
           userId: user_id,
           orderNumber: order_number,
            items: orderItems,
            totalAmount: finalTotal,
            subtotalAmount: subtotalAmount,
            discountAmount: discountAmount,
            couponCode: validCoupon?.code,
            addressId:address_id,
            address: user.addresses.find(addr => addr._id?.toString() === address_id) || undefined,
            status: 'processing',
            orderType: order_type,
            paymentId: paymentData.id.toString(),
            paymentStatus: paymentData.status,
            paymentMethod:  paymentData.payment_method_id,
            preferenceId: paymentData.preference_id 
           || paymentData.preferenceId 
           || paymentData.preference?.id
           || null,
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
            await couponRepository.markCouponAsUsed(validCoupon.code, user_id);
            console.log(`🎫 Cupón marcado como usado: ${validCoupon.code}`);
        }

        // 9. LIMPIAR CARRITO
        await userRepository.clearUserCart(user_id);
        console.log(`🧹 Carrito limpiado`);

        return savedOrder;

    } catch (error) {
        console.error('❌ Error creando orden desde metadata:', error);

        throw error;
    }
};

export const getAllOrderDetails = async (req: Request, res: Response) => {
    try {
        const orderDetails = await orderRepository.getAllOrderDetails();
        res.status(200).json(orderDetails);
    } catch (error) {
        res.status(500).json(error);
    }
}

export const getOrderByNumber = async (req: Request, res: Response) => {
    try {
        const { orderNumber} = req.params;
        const order = await orderRepository.getOrderByNumber(orderNumber);

        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
            return;
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json(error);
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