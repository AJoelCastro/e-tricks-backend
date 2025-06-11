import express from 'express';
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from '../controllers/Product';
import authenticateClerkToken from '../middleware/auth';
const router = express.Router();

router.get('/get', authenticateClerkToken, getProducts);
router.get('/:id/get', getProductById);
router.post('/create', createProduct);
router.put('/:id/update', updateProduct);
router.delete('/:id/delete', deleteProduct);

export default router;