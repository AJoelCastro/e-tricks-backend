import express from "express";
import { createListFavorite, getFavoritesUser } from "../controllers/Favorite";
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

router.get('/:id/get', authenticateClerkToken, getFavoritesUser); 
router.post('/:id/create', authenticateClerkToken, createListFavorite);

export default router;