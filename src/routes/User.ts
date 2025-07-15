import express from "express";
import { getFavorites, getCartItems, verifyUser, addFavorite, getFavoriteIds, removeFavorite, addCartItem } from "../controllers/User";
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();
router.get('/verifyUser/:userId', authenticateClerkToken, verifyUser)
router.get('/getFavorites/:userId', authenticateClerkToken, getFavorites); 
router.get('/getFavoriteIds/:userId', authenticateClerkToken, getFavoriteIds);
router.post('/addFavorite/:userId', authenticateClerkToken, addFavorite)
router.delete('/removeFavorite/:userId', authenticateClerkToken, removeFavorite)
router.get('/getCartItems/:userId', authenticateClerkToken, getCartItems)
router.post('/addCartItem/:userId', authenticateClerkToken, addCartItem)


export default router;