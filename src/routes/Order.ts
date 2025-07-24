import express from 'express'
import bodyParser from 'body-parser';
import {
    createOrder,
    confirmOrderPayment,
    getOrderDetails,
    getUserOrders,
    cancelOrder,
    handleWebhook,

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


router.post('/webhook',
    bodyParser.raw({ type: 'application/json' }),
    handleWebhook 
);

export default router;