import express from "express";
import { getFavoritesByIdUsuario } from "../controllers/Favorite";
import authenticateClerkToken from '../middleware/auth';

const router = express.Router();

router.get('/:id/get', authenticateClerkToken, getFavoritesByIdUsuario);

export default router;