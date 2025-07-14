import express from "express";
import { getFavorites, getCartItems, verifyUser, addFavorite, getFavoriteIds, removeFavorite } from "../controllers/User";
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();
router.get('/verifyUser/:idClerk', authenticateClerkToken, verifyUser)
router.get('/getFavorites/:idClerk', authenticateClerkToken, getFavorites); 
router.get('/getFavoriteIds/:idClerk', authenticateClerkToken, getFavoriteIds);
router.get('/getCartItems/:idClerk', authenticateClerkToken, getCartItems)
router.post('/addFavorite/:idClerk', authenticateClerkToken, addFavorite)
router.delete('/removeFavorite/:idClerk', authenticateClerkToken, removeFavorite)


export default router;