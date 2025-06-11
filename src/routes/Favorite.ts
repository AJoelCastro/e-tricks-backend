import express from "express";
import { createListFavorite, getFavoritesUser } from "../controllers/Favorite";
import authenticateClerkToken from '../middleware/auth';

const router = express.Router();

router.get('/:id/get', authenticateClerkToken, getFavoritesUser); 
router.post('/:id/create', authenticateClerkToken, createListFavorite);

export default router;