
import express from 'express'
import bodyParser from 'body-parser';
import {
    getOrderDetails,
    getUserOrders,
    cancelOrder,
    handleWebhook,
    createPreference,
    requestItemRefund, 
    getRefundableItems ,
    getOrderByNumber,
    getAllOrderDetails

} from "../controllers/Order";
const authenticateClerkToken = require('../middleware/auth');
const authenticateAdminToken = require('../middleware/authAdmin');

const router = express.Router();
router.get('/getAll', authenticateAdminToken, getAllOrderDetails);
// Obtener detalles de una orden con el número de orden
router.get('/:oNumber/onumber', authenticateClerkToken, getOrderByNumber);

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