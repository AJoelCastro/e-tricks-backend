import express from 'express';
import { 
    getCategories, 
    getCategoryById, 
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/Category';
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();


router.get('/get', getCategories);
router.get('/:id/get', getCategoryById);


router.post('/create', authenticateClerkToken, createCategory);
router.put('/:id/update', authenticateClerkToken, updateCategory);
router.delete('/:id/delete', authenticateClerkToken, deleteCategory);

export default router;