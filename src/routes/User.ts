import express from "express";
import { getFavoriteList } from "../controllers/User";
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

router.get('/getFL', getFavoriteList); 

export default router;