import { Request, Response } from "express";
import { IMaterialRequest } from "../interfaces/Material";
import { MaterialRepository } from "../repositories/Material";

const materialRepository = new MaterialRepository();

export async function createMaterial(req: Request, res: Response) {
    try {
        const data: IMaterialRequest = req.body;
        if (!data.name) {
            res.status(400).json({ message: "Falta el nombre del material" });
            return;
        }
        const exists = await materialRepository.exists(data.name);
        if (exists) {
            res.status(400).json({ message: "El material ya existe" });
            return;
        }
        const newMaterial = await materialRepository.create(data);
        res.status(201).json(newMaterial);
    } catch (error) {
        res.status(500).json({ error: (error instanceof Error ? error.message : error) });
    }
}

export async function getAllMaterials(req: Request, res: Response) {
    try {
        const materials = await materialRepository.getAll();
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ error: (error instanceof Error ? error.message : error) });
    }
}

export async function getMaterialById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const material = await materialRepository.getById(id);
        res.status(200).json(material);
    } catch (error) {
        res.status(500).json({ error: (error instanceof Error ? error.message : error) });
    }
}

export async function updateMaterial(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const data: IMaterialRequest = req.body;
        const updatedMaterial = await materialRepository.update(id, data);
        res.status(200).json(updatedMaterial);
    } catch (error) {
        res.status(500).json({ error: (error instanceof Error ? error.message : error) });
    }
}

export async function deleteMaterial(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await materialRepository.delete(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: (error instanceof Error ? error.message : error) });
    }
}
