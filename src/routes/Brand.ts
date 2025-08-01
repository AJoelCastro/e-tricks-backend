import  express  from "express";
import { getBrands, getBrandById, createBrand, updateBrand, deleteBrand,getBrandsWithCategoryProducts, getBrandsWithCategoryProductsWithProducts } from "../controllers/Brand";

const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

router.get('/get', getBrands);
router.get('/:id/get', getBrandById);
router.get('/getCategoryWithBrands', getBrandsWithCategoryProducts)
router.get('/getCategoryWithBrandsWithProducts', getBrandsWithCategoryProductsWithProducts)

router.post('/create', createBrand);
router.put('/:id/update', authenticateClerkToken, updateBrand);
router.delete('/:id/delete', authenticateClerkToken, deleteBrand);

export default router;

