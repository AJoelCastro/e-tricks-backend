import { ICategoryRequest, ICategoryUpdateRequest, ICategory } from "../interfaces/Category";
import { CategoryModel } from "../models/Category";


export class CategoryRepository {
    async getAll() {
        try {
            return await CategoryModel.find();
        } catch (error) {
            throw error;
        }
    }
    async getById(id: string) {
        try {
            return await CategoryModel.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async create(category: ICategoryRequest) {
        try {
            return await CategoryModel.create(category);
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, data: ICategoryUpdateRequest): Promise<ICategory | null> {
        return await CategoryModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<ICategory | null> {
        return await CategoryModel.findByIdAndDelete(id);
    }

    async exists(name: string): Promise<boolean> {
        const category = await CategoryModel.findOne({ name });
        return !!category;
    }
}