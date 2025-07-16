import express from "express";
import {
  getFavorites,
  getCartItems,
  verifyUser,
  addFavorite,
  getFavoriteIds,
  removeFavorite,
  addCartItem,
  removeCartItem,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from "../controllers/User";

const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

// Usuario y favoritos
router.get('/verifyUser/:userId', authenticateClerkToken, verifyUser);
router.get('/getFavorites/:userId', authenticateClerkToken, getFavorites);
router.get('/getFavoriteIds/:userId', authenticateClerkToken, getFavoriteIds);
router.post('/addFavorite/:userId', authenticateClerkToken, addFavorite);
router.delete('/removeFavorite/:userId', authenticateClerkToken, removeFavorite);

// Carrito
router.get('/getCartItems/:userId', authenticateClerkToken, getCartItems);
router.post('/addCartItem/:userId', authenticateClerkToken, addCartItem);
router.delete('/removeCartItem/:userId', authenticateClerkToken, removeCartItem);

// Direcciones
router.get('/addresses/:userId', authenticateClerkToken, getAddresses);
router.post('/addresses/:userId', authenticateClerkToken, addAddress);
router.put('/addresses/:userId/:addressId', authenticateClerkToken, updateAddress);
router.delete('/addresses/:userId/:addressId', authenticateClerkToken, deleteAddress);

export default router;
