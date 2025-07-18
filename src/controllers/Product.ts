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
        console.log(data)
        // Validaciones mínimas (opcional, también puedes usar un middleware de validación)
        if (!data.name || !data.description || !data.price || !data.size || !data.stock || !data.category || !data.images || !data.images || !data.marca) {
            res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const newProduct = await productRepository.create(data);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el producto', error });
    }
};
