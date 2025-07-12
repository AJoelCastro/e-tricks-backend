import express from "express";
import { getFavorites, getCartItems, verifyUser } from "../controllers/User";
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();
router.get('/verifyUser/:idClerk', authenticateClerkToken, verifyUser)
router.get('/getFavorites', authenticateClerkToken, getFavorites); 
router.get('/getCartItems', authenticateClerkToken, getCartItems)

export default router;