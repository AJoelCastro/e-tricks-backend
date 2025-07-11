import { Request, Response } from "express";
import Favorite from "../models/User";

//Crear una lista de favoritos
export const createListFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;
        const newFavorite = new Favorite({ id });
        await newFavorite.save();
        res.status(201).json(newFavorite);
    } catch (error) {
        res.status(500).json({ message: "Error al crear la lista de favoritos", error });
    }
}
//Obtener favoritos de un usuario
export const getFavoritesUser = async (req: Request, res: Response): Promise<void>=>{
    try {
        const { id } = req.body;
        const favorites = Favorite.find({ id })
        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener favoritos del usuario", error })
    }
}
