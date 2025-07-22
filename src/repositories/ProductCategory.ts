import { IProductCategoryRequest, IProductCategoryUpdateRequest, IProductCategory } from "../interfaces/ProductCategory";
import { ProductCategoryModel } from "../models/ProductCategory";


export class ProductCategoryRepository {
    async getAll() {
        try {
            return await ProductCategoryModel.find();
        } catch (error) {
            throw error;
        }
    }
    async getById(id: string) {
        try {
            return await ProductCategoryModel.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async create(category: IProductCategoryRequest) {
        try {
            return await ProductCategoryModel.create(category);
        } catch (error) {
            throw error;
        }
    }

    async update(id: string, data: IProductCategoryUpdateRequest): Promise<IProductCategory | null> {
        return await ProductCategoryModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<IProductCategory | null> {
        return await ProductCategoryModel.findByIdAndDelete(id);
    }

    async exists(name: string): Promise<boolean> {
        const category = await ProductCategoryModel.findOne({ name });
        return !!category;
    }
}