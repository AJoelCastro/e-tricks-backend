import { IPickUpRequest } from "../interfaces/PickUp";
import { PickUpModel } from "../models/PickUp";

export class PickUpRepository {
    async getAll() {
        try {
            return await PickUpModel.find();
        } catch (error) {
            throw error;
        }
    }
    async getOne(id: string) {
        try {
            return await PickUpModel.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async create(data: IPickUpRequest) {
        try {
            return await PickUpModel.create(data);
        } catch (error) {
            throw error;
        }
    }
    async update(id: string, data: IPickUpRequest) {
        try {
            return await PickUpModel.findByIdAndUpdate(id, data, { new: true });
        } catch (error) {
            throw error;
        }
    }
    async delete(id: string) {
        try {
            return await PickUpModel.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    }
}