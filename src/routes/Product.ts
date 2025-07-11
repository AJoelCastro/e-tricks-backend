import express from 'express';
import { 
    getProducts, 
    getProductById, 
    createProduct, 
} from '../controllers/Product';
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

router.get('/get', getProducts);
router.get('/:id/get', getProductById);
router.post('/create', createProduct);

export default router;