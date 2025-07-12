import { Request, Response } from "express";
import { UserRepository } from "../repositories/User";
import { IUserRequest } from "../interfaces/User";

const userRepository = new UserRepository();

export const createFavoriteList = async (data: IUserRequest) =>{
    try {
        return await userRepository.createFavoriteList(data);
    } catch (error) {
        throw error;
    }
}

export const getFavoriteList = async (req: Request, res: Response): Promise<void> =>{
    try {
        const data: IUserRequest = req.body
        if(!data.idClerk){
            res.status(400).json({message: 'El id del usuario es obligatorio'})
        }
        const verify = await userRepository.verifyExistFavoritesList(data.idClerk);
        if(verify===null){
            const dataCreate = await createFavoriteList(data);
            console.log("data create", dataCreate)
            res.status(201).json(dataCreate)
            return;
        }
        res.status(200).json(verify);
    } catch (error) {
        throw error
    }
}