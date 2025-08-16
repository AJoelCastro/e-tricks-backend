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
    getProductsByIdMarcaAndIdCategoryProduct,
    // Nuevas funciones para S3
    getAllProductFolders,
    getProductImages,
    createProductFolder,
    addImagesToFolder,
    deleteProductImage,
    deleteProductFolder,
    uploadMiddleware
} from '../controllers/Product';
const authenticateClerkToken = require('../middleware/auth');
const authenticateAdminToken = require('../middleware/authAdmin')

const router = express.Router();
// Rutas para S3
router.get('/folders', getAllProductFolders);
// Obtener todas las imágenes de una carpeta específica
router.get('/folders/:folderName/images', getProductImages);
// Crear nueva carpeta de producto con imágenes (requiere autenticación de admin)
router.post('/folders/create', 
    authenticateAdminToken, 
    uploadMiddleware, 
    createProductFolder
);

// Agregar más imágenes a una carpeta existente (requiere autenticación de admin)
router.post('/folders/:folderName/images', 
    authenticateAdminToken, 
    uploadMiddleware, 
    addImagesToFolder
);

// Eliminar una imagen específica (requiere autenticación de admin)
router.delete('/folders/:folderName/images/:fileName', 
    authenticateAdminToken, 
    deleteProductImage
);

// Eliminar carpeta completa con todas sus imágenes (requiere autenticación de admin)
router.delete('/folders/:folderName', 
    authenticateAdminToken, 
    deleteProductFolder
);


router.get('/get', getProducts);
router.get('/:id/get', getProductById);
router.get('/:groupCategory/:subCategory/:prodCategory/products', getByIdGroupByIdSubByIdCategoryProduct);
router.get('/:groupCategory/:subCategory/products', getByIdGroupByIdSubProduct);
router.get('/:marcaCategory/productsBrands', getProductsByIdMarca);
router.get('/:marcaCategory/:prodCategory/productsBrands', getProductsByIdMarcaAndIdCategoryProduct);
router.get('/getWithDescuento', getProductsWithDescuento);
router.get('/getNewProducts', getNewProducts);

router.post('/create', authenticateAdminToken,createProduct);
router.put('/:id/update',authenticateClerkToken, getProductById);
router.delete('/:id/delete',authenticateClerkToken, getProductById);

export default router;