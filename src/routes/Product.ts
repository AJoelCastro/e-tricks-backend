import express from 'express';
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    getByIdGroupByIdSubByIdCategoryProduct,
    getByIdGroupByIdSubProduct,
    getProductsWithDescuento,
    getNewProducts,
    getProductsByIdMarca,
    getProductsByIdMarcaAndIdCategoryProduct
} from '../controllers/Product';
const authenticateClerkToken = require('../middleware/auth');

const router = express.Router();

router.get('/get', getProducts);
router.get('/:id/get', getProductById);
router.get('/:groupCategory/:subCategory/:prodCategory/products', getByIdGroupByIdSubByIdCategoryProduct);
router.get('/:groupCategory/:subCategory/products', getByIdGroupByIdSubProduct);
router.get('/:marcaCategory/productsBrands', getProductsByIdMarca);
router.get('/:marcaCategory/:prodCategory/productsBrands', getProductsByIdMarcaAndIdCategoryProduct);
router.get('/getWithDescuento', getProductsWithDescuento);
router.get('/getNewProducts', getNewProducts);

router.post('/create', createProduct);
router.put('/:id/update',authenticateClerkToken, getProductById);
router.delete('/:id/delete',authenticateClerkToken, getProductById);

export default router;