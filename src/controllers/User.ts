import { Request, Response } from "express";
import { UserRepository } from "../repositories/User";
import { IUserRequest } from "../interfaces/User";

const userRepository = new UserRepository();

export const createFavoriteCartList = async (data: IUserRequest) =>{
    try {
        return await userRepository.createFavoriteCartList(data);
    } catch (error) {
        throw error;
    }
}

export const verifyUser = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId
        if(!userId){
            res.status(400).json({message: 'El id del usuario es obligatorio'})
        }
        const data: IUserRequest = {
            userId: userId,
            favorites: [],
            cart: []
        }
        const verify = await userRepository.verifyExistUser(userId);
        if(verify===null){
            const dataCreate = await createFavoriteCartList(data);
            res.status(201).json(dataCreate)
            return;
        }
        res.status(200).json(verify);
    } catch (error) {
        throw error
    }
}

export const getFavorites = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId
        if(!userId){
            res.status(400).json({message: 'El id del usuario es obligatorio'})
        }
        const dataFavorites = await userRepository.getFavorites(userId)
        if (!dataFavorites || dataFavorites.favorites.length === 0) {
            res.status(200).json([]);
            return;
        }
        res.status(200).json(dataFavorites.favorites);
    } catch (error) {
        throw error
    }
}

export const getFavoriteIds = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId
        if(!userId){
            res.status(400).json({message: 'El id del usuario es obligatorio'})
        }
        const dataFavorites = await userRepository.getFavoriteIds(userId)
        res.status(200).json(dataFavorites);
    } catch (error) {
        throw error
    }
}

export const addFavorite = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId
        const {idProduct} = req.body
        if(!userId || !idProduct){
            res.status(400).json({message: 'El id del usuario y el id del producto son obligatorios'})
            return;
        }
        const dataAdd = await userRepository.addFavorite(userId, idProduct)
        res.status(201).json(dataAdd);
    } catch (error) {
        throw error
    }
}

export const removeFavorite = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId
        const {idProduct} = req.body
        if(!userId || !idProduct){
            res.status(400).json({message: 'El id del usuario y el id del producto son obligatorios'})
            return;
        }
        const dataRemove = await userRepository.removeFavorite(userId, idProduct);
        if (dataRemove.modifiedCount === 0) {
            res.status(404).json({ message: 'No se encontró el favorito para eliminar o ya fue eliminado' });
            return;
        }

        res.status(200).json({ message: 'Favorito eliminado correctamente', result: dataRemove });
    } catch (error) {
        throw error
    }
}

export const getCartItems = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId
        if(!userId){
            res.status(400).json({message: 'El id del usuario es obligatorio'})
        }
        const dataCart = await userRepository.getCartItems(userId)
        if (!dataCart || dataCart.cart.length === 0) {
            res.status(200).json([]);
            return;
        }
        res.status(200).json(dataCart.cart);
    } catch (error) {
        throw error
    }
}

export const addCartItem = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId
        const { idProduct, quantity, size } = req.body
        if(!userId || !idProduct || !quantity || !size ){
            res.status(400).json({message: 'El id del usuario y el id del producto son obligatorios'})
            return;
        }
        const dataAdd = await userRepository.addCartItem(userId, idProduct, quantity, size)
        res.status(201).json(dataAdd);
    } catch (error) {
        throw error
    }
}
