import express from 'express';
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from '../controllers/Product';
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

router.get('/get', getProducts);
router.get('/:id/get', getProductById);
router.post('/create', authenticateClerkToken, createProduct);
router.put('/:id/update', authenticateClerkToken, updateProduct);
router.delete('/:id/delete', authenticateClerkToken, deleteProduct);

export default router;