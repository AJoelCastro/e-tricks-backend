import express from 'express'
import bodyParser from 'body-parser';
import {
    createOrder,
    confirmOrderPayment,
    getOrderDetails,
    getUserOrders,
    cancelOrder,
    handleWebhook,
    createPreference,
    requestItemRefund, 
    getRefundableItems 

} from "../controllers/Order";
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

// Crear nueva orden y obtener preferencia de MercadoPago
router.post('/checkout', authenticateClerkToken, createOrder);

// Confirmar pago manualmente (opcional)
router.post('/checkout/payment/confirm', authenticateClerkToken, confirmOrderPayment );

// Obtener detalles de una orden específica
router.get('/:orderId', authenticateClerkToken, getOrderDetails);

// Obtener todas las órdenes de un usuario
router.get('/user/:userId', authenticateClerkToken, getUserOrders );

// Cancelar una orden
router.delete('/:orderId', authenticateClerkToken, cancelOrder );

// Obtener preferenceId desde MercadoPago
router.post('/checkout/preference', authenticateClerkToken, createPreference);

router.post('/webhook',bodyParser.raw({ type: 'application/json' }),handleWebhook);

router.post('/refund/:orderId/:itemId',  authenticateClerkToken, requestItemRefund);

router.get('/refundable/:orderId', authenticateClerkToken, getRefundableItems);

export default router;