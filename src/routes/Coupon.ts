import express from 'express';
import {
    validateCoupon,
    createCoupon,
    listCoupons
} from "../controllers/Coupon";
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post('/validate', authenticate, validateCoupon);
router.post('/', authenticate, createCoupon);
router.get('/', authenticate, listCoupons);

export default router;