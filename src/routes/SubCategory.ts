import express from 'express';
import { 
    getSubCategories,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    toggleSubCategoryStatus,
    deleteSubCategory,
    getCategoriesFromGroup,
    getProductsBySubCategory
} from '../controllers/SubCategory';
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();


router.get('/get', getSubCategories);
router.get('/:id/get', getSubCategoryById);
router.get('/:id/categories', getCategoriesFromGroup);
router.get('/:id/products', getProductsBySubCategory);

router.post('/create', authenticateClerkToken, createSubCategory);
router.put('/:id/update', authenticateClerkToken, updateSubCategory);
router.patch('/:id/toggle-status', authenticateClerkToken, toggleSubCategoryStatus);
router.delete('/:id/delete', authenticateClerkToken, deleteSubCategory);



export default router;