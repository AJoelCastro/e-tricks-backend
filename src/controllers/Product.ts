import { Request, Response } from 'express';
import { ProductRepository } from '../repositories/Product';
import { IProductRequest } from '../interfaces/Product';

const productRepository = new ProductRepository()
// Obtener todos los productos
export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await productRepository.getAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos', error });
    }
};

// Obtener un producto por ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = req.params.id;
        const product = await productRepository.getById(productId);
        if (!product) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error });
    }
};

// Crear un nuevo producto
export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const data: IProductRequest = req.body;
        if (
            !data.name || 
            !data.description || 
            !data.price || 
            !data.stockPorTalla || 
            !data.material ||
            !data.category || 
            !data.images || 
            !data.brand ||
            !data.isNewProduct ||
            !data.subCategory ||
            !data.groupCategory ||
            !data.caracteristicas
        ) {
            res.status(400).json({ message: 'Faltan campos obligatorios' });
            return;
        }

        if (!Array.isArray(data.stockPorTalla) || data.stockPorTalla.length === 0) {
            res.status(400).json({ message: 'Stock por talla debe ser un arreglo con al menos un elemento' });
            return;
        }

        const newProduct = await productRepository.create(data);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el producto', error });
    }
};

// Actualizar un producto por ID
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = req.params.id;
        const data: IProductRequest = req.body;
        const updatedProduct = await productRepository.update(productId, data);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el producto', error });
    }
};

// Eliminar un producto por ID
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = req.params.id;
        const deletedProduct = await productRepository.delete(productId);
        res.status(200).json(deletedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error al eliminar el producto', error });
    }
};

export const getByIdGroupByIdSubByIdCategoryProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupCategory = req.params.groupCategory;
        const subCategory = req.params.subCategory;
        const prodCategory = req.params.prodCategory;
        const products = await productRepository.getByIdGroupByIdSubByIdCategoryProduct( groupCategory, subCategory, prodCategory);
        if (!products) {
            res.status(404).json({ message: 'Productos no encontrados' });
            return;
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error });
    }
}

export const getByIdGroupByIdSubProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupCategory = req.params.groupCategory;
        const subCategory = req.params.subCategory;
        const products = await productRepository.getByIdGroupByIdSubProduct( groupCategory, subCategory);
        if (!products) {
            res.status(404).json({ message: 'Productos no encontrados' });
            return;
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error });
    }
}

export const getProductsWithDescuento = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await productRepository.getProductsWithDescuento();
        if (!products) {
            res.status(404).json({ message: 'Productos no encontrados' });
            return;
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error });
    }
}

export const getNewProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await productRepository.getNewProducts();
        if (!products) {
            res.status(404).json({ message: 'Productos no encontrados' });
            return;
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error });
    }
}
