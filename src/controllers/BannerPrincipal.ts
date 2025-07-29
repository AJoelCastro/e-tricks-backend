import { Request, Response } from "express";
import { BannerPrincipalRepository } from "../repositories/BannerPrincipal";
import { IBannerPrincipalRequest } from "../interfaces/BannerPrincipal";

const bannerPrincipalRepository = new BannerPrincipalRepository();

export const createBannerPrincipal = async (req: Request, res: Response): Promise<void> => {
    try {
        const data: IBannerPrincipalRequest = req.body;
        const bannerPrincipal = await bannerPrincipalRepository.create(data);
        res.status(201).json(bannerPrincipal);
    } catch (error) {
        res.status(400).json({ message: "Error al crear el banner principal", error });
    }
};

export const updateBannerPrincipal = async (req: Request, res: Response): Promise<void> => {
    try {
        const bannerPrincipalId = req.params.id;
        const data: IBannerPrincipalRequest = req.body;
        const updatedBannerPrincipal = await bannerPrincipalRepository.update(bannerPrincipalId, data);
        res.status(200).json(updatedBannerPrincipal);
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar el banner principal", error });
    }
};

export const deleteBannerPrincipal = async (req: Request, res: Response): Promise<void> => {
    try {
        const bannerPrincipalId = req.params.id;
        const deletedBannerPrincipal = await bannerPrincipalRepository.delete(bannerPrincipalId);
        res.status(200).json(deletedBannerPrincipal);
    } catch (error) {
        res.status(400).json({ message: "Error al eliminar el banner principal", error });
    }
};

export const getBannerPrincipalById = async (req: Request, res: Response): Promise<void> => {
    try {
        const bannerPrincipalId = req.params.id;
        const bannerPrincipal = await bannerPrincipalRepository.getById(bannerPrincipalId);
        if (!bannerPrincipal) {
            res.status(404).json({ message: "Banner principal no encontrado" });
            return;
        }
        res.status(200).json(bannerPrincipal);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el banner principal", error });
    }
};

export const getAllBannerPrincipal = async (req: Request, res: Response): Promise<void> => {
    try {
        const bannerPrincipal = await bannerPrincipalRepository.getAll();
        res.status(200).json(bannerPrincipal);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el banner principal", error });
    }
};

export const updateStatusBannerPrincipal = async (req: Request, res: Response): Promise<void> => {
    try {
        const bannerPrincipalId = req.params.id;
        const { status } = req.body;
        const updatedBannerPrincipal = await bannerPrincipalRepository.updateStatus(bannerPrincipalId, status);
        res.status(200).json(updatedBannerPrincipal);
    } catch (error) {
        res.status(400).json({ message: "Error al actualizar el status del banner principal", error });
    }
}