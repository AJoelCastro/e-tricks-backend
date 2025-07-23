import { Request, Response } from "express";
import { PickUpRepository } from "../repositories/PickUp";
import { IPickUpRequest } from "../interfaces/PickUp";

const pickUpRepository = new PickUpRepository();

export const createPickUp = async (req: Request, res: Response) => {
    try {
        const data: IPickUpRequest = req.body;
        const pickUp = await pickUpRepository.create(data);
        res.status(200).json(pickUp);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const getAllPickUps = async (req: Request, res: Response) => {
    try {
        const pickUps = await pickUpRepository.getAll();
        res.status(200).json(pickUps);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const getPickUpById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pickUp = await pickUpRepository.getOne(id);
        res.status(200).json(pickUp);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const updatePickUp = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data: IPickUpRequest = req.body;
        const pickUp = await pickUpRepository.update(id, data);
        res.status(200).json(pickUp);
    } catch (error) {
        res.status(500).json(error);
    }
};

export const deletePickUp = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pickUp = await pickUpRepository.delete(id);
        res.status(200).json(pickUp);
    } catch (error) {
        res.status(500).json(error);
    }
};