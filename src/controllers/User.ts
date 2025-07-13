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
        const idClerk = req.params.idClerk
        if(!idClerk){
            res.status(400).json({message: 'El id del usuario es obligatorio'})
        }
        const data: IUserRequest = {
            idClerk: idClerk,
            favorites: [],
            cart: []
        }
        const verify = await userRepository.verifyExistUser(idClerk);
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
        const idClerk = req.params.idClerk
        if(!idClerk){
            res.status(400).json({message: 'El id del usuario es obligatorio'})
        }
        const dataFavorites = await userRepository.getFavorites(idClerk)
        if (!dataFavorites || dataFavorites.favorites.length === 0) {
            res.status(200).json({ favorites: [] });
            return;
        }
        res.status(200).json(dataFavorites.favorites);
    } catch (error) {
        throw error
    }
}

export const getFavoriteIds = async (req: Request, res: Response): Promise<void> =>{
    try {
        const idClerk = req.params.idClerk
        if(!idClerk){
            res.status(400).json({message: 'El id del usuario es obligatorio'})
        }
        const dataFavorites = await userRepository.getFavoriteIds(idClerk)
        res.status(200).json(dataFavorites);
    } catch (error) {
        throw error
    }
}

export const addFavorite = async (req: Request, res: Response): Promise<void> =>{
    try {
        const idClerk = req.params.idClerk
        const {idProduct} = req.body
        if(!idClerk || !idProduct){
            res.status(400).json({message: 'El id del usuario y el id del producto son obligatorios'})
            return;
        }
        const dataAdd = await userRepository.addFavorite(idClerk, idProduct)
        res.status(201).json(dataAdd);
    } catch (error) {
        throw error
    }
}

export const getCartItems = async (req: Request, res: Response): Promise<void> =>{
    try {
        const idClerk = req.params.idClerk
        if(!idClerk){
            res.status(400).json({message: 'El id del usuario es obligatorio'})
        }
        const verify = await userRepository.verifyExistUser(idClerk);
        if(verify===null){
            res.status(400).json({message: 'El usuario no existe'})
            return;
        }
        res.status(200).json(verify.cart);
    } catch (error) {
        throw error
    }
}
