import { Request, Response } from "express";
import Favorite from "../models/Favorite";

//Obtener favoritos de un usuario
export const getFavoritesByIdUsuario = async (req: Request, res: Response): Promise<void>=>{
    try {
        const favorites = Favorite.find()
        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener favoritos del usuario", error })
    }
}
export const createListFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const { idUsuario } = req.body;
        const newFavorite = new Favorite({ idUsuario });
        await newFavorite.save();
        res.status(201).json(newFavorite);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la lista de favoritos", error });
    }
}