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

export const getFavoriteCartList = async (req: Request, res: Response): Promise<void> =>{
    try {
        const data: IUserRequest = req.body
        if(!data.idClerk){
            res.status(400).json({message: 'El id del usuario es obligatorio'})
        }
        const verify = await userRepository.verifyExistFavoritesList(data.idClerk);
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