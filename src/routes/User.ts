import express from "express";
import { getFavoriteCartList } from "../controllers/User";
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

router.get('/getFCL', authenticateClerkToken, getFavoriteCartList); 

export default router;