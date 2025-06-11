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