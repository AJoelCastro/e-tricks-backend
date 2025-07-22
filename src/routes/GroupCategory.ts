import express from 'express';
import { 
    getGroupCategories,
    getGroupCategoryById,
    createGroupCategory,
    updateGroupCategory,
    toggleGroupCategoryStatus,
    deleteGroupCategory,
    getSubCategoriesFromGroup
} from '../controllers/GroupCategory';
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();


router.get('/get', getGroupCategories);
router.get('/:id/get', getGroupCategoryById);
router.get('/:id/subcategories', getSubCategoriesFromGroup);


router.post('/create', authenticateClerkToken, createGroupCategory);
router.put('/:id/update', authenticateClerkToken, updateGroupCategory);
router.patch('/:id/toggle-status', authenticateClerkToken, toggleGroupCategoryStatus);
router.delete('/:id/delete', authenticateClerkToken, deleteGroupCategory);



export default router;