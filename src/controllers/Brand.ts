import { Request, Response } from "express";
import { BrandRepository } from "../repositories/Brand";
import { IBrandRequest } from "../interfaces/Brand";

const brandRepository = new BrandRepository();

export const getBrands = async (req: Request, res: Response): Promise<void> => {
    try {
        const brands = await brandRepository.getAll();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener marcas", error });
    }
}
export const getBrandById = async (req: Request, res: Response): Promise<void> => {
    try {
        const brandId = req.params.id;
        const brand = await brandRepository.getById(brandId);
        if (!brand) {
            res.status(404).json({ message: "Marca no encontrada" });
            return;
        }
        res.status(200).json(brand);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la marca", error });
    }
}

export const createBrand = async (req: Request, res: Response): Promise<void> => {
    try {
        const data: IBrandRequest = req.body;
        if (!data.name || !data.image) {
            res.status(400).json({ message: "Faltan datos de la marca" });
            return;
        }
        const exists = await brandRepository.exists(data.name);
        if (exists) {
            res.status(400).json({ message: "La marca ya existe" });
            return;
        }
        const newBrand = await brandRepository.create(data);
        res.status(201).json(newBrand);
    } catch (error) {
        res.status(400).json({ message: "Error al crear la marca", error });
    }
}

export const updateBrand = async (req: Request, res: Response): Promise<void> => {
    try {
        const brandId = req.params.id;
        const data: IBrandRequest = req.body;
        const updatedBrand = await brandRepository.update(brandId, data);
        res.status(200).json(updatedBrand);
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar la marca", error });
    }
}

export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
    try {
        const brandId = req.params.id;
        const deletedBrand = await brandRepository.delete(brandId);
        if (!deletedBrand) {
            res.status(404).json({ message: "Marca no encontrada" });
            return;
        }
        res.status(200).json({ message: "Marca eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la marca", error });
    }
}

export const getBrandsWithCategoryProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const brands = await brandRepository.getBrandsWithCategoryProducts();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener marcas con categorias de productos", error });
    }
}
