import { Request, Response } from 'express';
import { ProductRepository } from '../repositories/Product';
import { IProductRequest } from '../interfaces/Product';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, ListObjectsV2Command, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const productRepository = new ProductRepository()

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'tricks-bucket';
// Obtener todas las carpetas de productos
// Configuración de multer para manejar archivos en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB límite
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'));
        }
    }
});

// Middleware para subir múltiples archivos
export const uploadMiddleware = upload.array('images', 10);

// 1. Obtener todas las carpetas de productos
export const getAllProductFolders = async (req: Request, res: Response): Promise<void> => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'productos/',
            Delimiter: '/'
        });

        const response = await s3Client.send(command);

        const folders = response.CommonPrefixes?.map(prefix => {
            const folderPath = prefix.Prefix?.replace('productos/', '').replace('/', '');
            return {
                folderName: folderPath,
                fullPath: prefix.Prefix
            };
        }) || [];

        res.status(200).json({
            totalFolders: folders.length,
            folders
        });

    } catch (error) {
        console.error('Error al obtener carpetas:', error);
        res.status(500).json({ message: 'Error al obtener las carpetas de productos', error });
    }
};

// 2. Obtener todas las imágenes de una carpeta específica
export const getProductImages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { folderName } = req.params;
        
        if (!folderName) {
            res.status(400).json({ message: 'El nombre de la carpeta es requerido' });
            return;
        }

        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: `productos/${folderName}/`,
            Delimiter: '/'
        });

        const response = await s3Client.send(command);

        const images = await Promise.all(
            (response.Contents || [])
                .filter(obj => {
                    const key = obj.Key || '';
                    return key !== `productos/${folderName}/` && // Excluir la carpeta misma
                           /\.(jpg|jpeg|png|webp)$/i.test(key); // Solo archivos de imagen
                })
                .map(async (obj) => {
                    const key = obj.Key!;
                    const fileName = key.split('/').pop() || '';
                    
                    // Generar URL firmada válida por 1 hora
                    const signedUrl = await getSignedUrl(
                        s3Client,
                        new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
                        { expiresIn: 3600 }
                    );

                    return {
                        fileName,
                        key,
                        size: obj.Size,
                        lastModified: obj.LastModified,
                        url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
                        signedUrl // URL firmada para acceso privado si es necesario
                    };
                })
        );

        res.status(200).json({
            folderName,
            totalImages: images.length,
            images
        });

    } catch (error) {
        console.error('Error al obtener imágenes:', error);
        res.status(500).json({ message: 'Error al obtener las imágenes del producto', error });
    }
};

// 3. Crear una nueva carpeta de producto y subir imágenes
export const createProductFolder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productName } = req.body;
        const files = req.files as Express.Multer.File[];

        if (!productName) {
            res.status(400).json({ message: 'El nombre del producto es requerido' });
            return;
        }

        if (!files || files.length === 0) {
            res.status(400).json({ message: 'Se requiere al menos una imagen' });
            return;
        }

        // Limpiar el nombre del producto para usarlo como nombre de carpeta
        const cleanProductName = productName.trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ');
        const folderPath = `productos/${cleanProductName}`;

        // Verificar si la carpeta ya existe
        const existingFolder = await checkFolderExists(folderPath);
        if (existingFolder) {
            res.status(400).json({ message: 'Ya existe una carpeta con este nombre de producto' });
            return;
        }

        const uploadPromises = files.map(async (file, index) => {
            const fileExtension = file.originalname.split('.').pop() || 'jpg';
            const fileName = `${uuidv4()}-${index}.${fileExtension}`;
            const key = `${folderPath}/${fileName}`;

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {
                    originalName: file.originalname,
                    uploadedAt: new Date().toISOString()
                }
            });

            await s3Client.send(command);

            return {
                fileName,
                key,
                originalName: file.originalname,
                size: file.size,
                url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
            };
        });

        const uploadedImages = await Promise.all(uploadPromises);

        res.status(201).json({
            message: 'Carpeta de producto creada exitosamente',
            productName: cleanProductName,
            folderPath,
            totalImages: uploadedImages.length,
            images: uploadedImages
        });

    } catch (error) {
        console.error('Error al crear carpeta de producto:', error);
        res.status(500).json({ message: 'Error al crear la carpeta del producto', error });
    }
};

// 4. Agregar más imágenes a una carpeta existente
export const addImagesToFolder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { folderName } = req.params;
        const files = req.files as Express.Multer.File[];

        if (!folderName) {
            res.status(400).json({ message: 'El nombre de la carpeta es requerido' });
            return;
        }

        if (!files || files.length === 0) {
            res.status(400).json({ message: 'Se requiere al menos una imagen' });
            return;
        }

        const folderPath = `productos/${folderName}`;

        // Verificar si la carpeta existe
        const folderExists = await checkFolderExists(folderPath);
        if (!folderExists) {
            res.status(404).json({ message: 'La carpeta del producto no existe' });
            return;
        }

        const uploadPromises = files.map(async (file, index) => {
            const fileExtension = file.originalname.split('.').pop() || 'jpg';
            const fileName = `${uuidv4()}-${Date.now()}-${index}.${fileExtension}`;
            const key = `${folderPath}/${fileName}`;

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {
                    originalName: file.originalname,
                    uploadedAt: new Date().toISOString()
                }
            });

            await s3Client.send(command);

            return {
                fileName,
                key,
                originalName: file.originalname,
                size: file.size,
                url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
            };
        });

        const uploadedImages = await Promise.all(uploadPromises);

        res.status(200).json({
            message: 'Imágenes agregadas exitosamente',
            folderName,
            totalNewImages: uploadedImages.length,
            newImages: uploadedImages
        });

    } catch (error) {
        console.error('Error al agregar imágenes:', error);
        res.status(500).json({ message: 'Error al agregar imágenes a la carpeta', error });
    }
};

// 5. Eliminar una imagen específica
export const deleteProductImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { folderName, fileName } = req.params;

        if (!folderName || !fileName) {
            res.status(400).json({ message: 'El nombre de la carpeta y archivo son requeridos' });
            return;
        }

        const key = `productos/${folderName}/${fileName}`;

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });

        await s3Client.send(command);

        res.status(200).json({
            message: 'Imagen eliminada exitosamente',
            deletedImage: {
                folderName,
                fileName,
                key
            }
        });

    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        res.status(500).json({ message: 'Error al eliminar la imagen', error });
    }
};

// 6. Eliminar una carpeta completa y todas sus imágenes
export const deleteProductFolder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { folderName } = req.params;

        if (!folderName) {
            res.status(400).json({ message: 'El nombre de la carpeta es requerido' });
            return;
        }

        const folderPath = `productos/${folderName}/`;

        // Primero, obtener todas las imágenes en la carpeta
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: folderPath
        });

        const listResponse = await s3Client.send(listCommand);
        
        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            res.status(404).json({ message: 'La carpeta no existe o está vacía' });
            return;
        }

        // Eliminar todas las imágenes
        const deletePromises = listResponse.Contents.map((obj:any) => {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: obj.Key!
            });
            return s3Client.send(deleteCommand);
        });

        await Promise.all(deletePromises);

        res.status(200).json({
            message: 'Carpeta y todas sus imágenes eliminadas exitosamente',
            folderName,
            deletedImages: listResponse.Contents.length
        });

    } catch (error) {
        console.error('Error al eliminar carpeta:', error);
        res.status(500).json({ message: 'Error al eliminar la carpeta del producto', error });
    }
};

// Función auxiliar para verificar si una carpeta existe
const checkFolderExists = async (folderPath: string): Promise<boolean> => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: folderPath + '/',
            MaxKeys: 1
        });

        const response = await s3Client.send(command);
        return (!!response.Contents && response.Contents.length > 0) || 
               (!!response.CommonPrefixes && response.CommonPrefixes.length > 0);
    } catch (error) {
        return false;
    }
};
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

export const getProductsByIdMarca = async (req: Request, res: Response): Promise<void> => {
    try {
        const marca = req.params.marcaCategory;
        const products = await productRepository.getProductsByIdMarca(marca);
        if (!products) {
            res.status(404).json({ message: 'Productos no encontrados' });
            return;
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error });
    }
}

export const getProductsByIdMarcaAndIdCategoryProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const marca = req.params.marcaCategory;
        const prodCategory = req.params.prodCategory;
        const products = await productRepository.getProductsByIdMarcaAndIdCategoryProduct(marca, prodCategory);
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
