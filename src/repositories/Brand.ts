import { IBrandRequest } from "../interfaces/Brand";
import { BrandModel } from "../models/Brand";
export class BrandRepository {
    async getAll() {
        try {
            return await BrandModel.find();
        } catch (error) {
            throw error;
        }
    }

    async getById(id: string) {
        try {
            return await BrandModel.findById(id);
        } catch (error) {
            throw error;
        }
    }

    async create(brand: IBrandRequest) {
        try {
            return await BrandModel.create(brand);
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, brand: IBrandRequest) {
        try {
            return await BrandModel.updateOne({ _id: id }, { $set: brand });
        } catch (error) {
            throw error;
        }
    }
    async delete(id: string) {
        try {
            return await BrandModel.deleteOne({ _id: id });
        } catch (error) {
            throw error;
        }
    }
}