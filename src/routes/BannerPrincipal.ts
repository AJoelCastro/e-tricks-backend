import express  from "express";
import { getAllBannerPrincipal, createBannerPrincipal, updateBannerPrincipal, deleteBannerPrincipal } from "../controllers/BannerPrincipal";
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

router.get('/get', getAllBannerPrincipal);
router.post('/create', createBannerPrincipal);
router.put('/:id/update', authenticateClerkToken, updateBannerPrincipal);
router.delete('/:id/delete', authenticateClerkToken, deleteBannerPrincipal);

export default router;