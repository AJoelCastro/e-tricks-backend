import express from "express";
import { 
    createOrder,
    confirmOrderPayment,
    getOrderDetails,
    getUserOrders,
    cancelOrder,
    handleOrderWebhook
} from "../controllers/Order";
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();


router.post('/checkout', authenticateClerkToken, createOrder as any);


router.post('/checkout/payment/confirm', authenticateClerkToken, confirmOrderPayment as any );


router.get('/:orderId', authenticateClerkToken, getOrderDetails as any);


router.get('/user/:userId', authenticateClerkToken, getUserOrders as any);


router.delete('/:orderId', authenticateClerkToken, cancelOrder as any);


router.post('/webhook', express.raw({type: 'application/json'}), handleOrderWebhook as any);

export default router;