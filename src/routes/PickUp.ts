import express from "express";
import { createPickUp, deletePickUp, getPickUpById, getAllPickUps, updatePickUp } from "../controllers/PickUp";
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

router.get('/get', getAllPickUps);
router.get('/:id/get', getPickUpById);
router.post('/create',  createPickUp);
router.put('/:id/update', authenticateClerkToken, updatePickUp);
router.delete('/:id/delete', authenticateClerkToken, deletePickUp);

export default router;