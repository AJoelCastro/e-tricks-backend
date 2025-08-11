import express from 'express';
import { 
    getAllMaterials, 
    getMaterialById, 
    createMaterial,
    updateMaterial,
    deleteMaterial
} from '../controllers/Material';
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

router.get('/getAll', getAllMaterials);
router.get('/:id', getMaterialById);
router.post('/create', createMaterial);
router.put('/:id/update', authenticateClerkToken, updateMaterial);
router.delete('/:id/delete', authenticateClerkToken, deleteMaterial);

export default router;
