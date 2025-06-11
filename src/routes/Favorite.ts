import express from "express";
import { createListFavorite, getFavoritesByIdUsuario } from "../controllers/Favorite";
import authenticateClerkToken from '../middleware/auth';

const router = express.Router();

router.get('/:id/get', authenticateClerkToken, getFavoritesByIdUsuario);
router.post('/create', authenticateClerkToken, createListFavorite);

export default router;