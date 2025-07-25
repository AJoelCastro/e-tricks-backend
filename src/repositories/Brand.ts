import { IBrandRequest } from "../interfaces/Brand";
import { BrandModel } from "../models/Brand";
import { ProductModel } from "../models/Product";
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

    async exists(name: string) {
        try {
            const brand = await BrandModel.findOne({ name });
            return !!brand;
        } catch (error) {
            throw error;
        }
    }

    async getBrandsWithCategoryProducts() {
        try {
            const result = await ProductModel.aggregate([
                {
                    $group: {
                        _id: "$brand",
                        categories: { $addToSet: "$category" } // extrae categorías únicas por brand
                    }
                },
                {
                    $lookup: {
                        from: "brands",
                        localField: "_id",
                        foreignField: "_id",
                        as: "brand"
                    }
                },
                {
                    $unwind: "$brand"
                },
                {
                    $lookup: {
                        from: "productcategories",
                        localField: "categories",
                        foreignField: "_id",
                        as: "categories"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        brand: {
                            _id: "$brand._id",
                            name: "$brand.name" // o cualquier otro campo que tenga Brand
                        },
                        categories: {
                            _id: 1,
                            name: 1 // o los campos que necesites de Category
                        }
                    }
                }
            ]);

            return result;
        } catch (error) {
            throw error;
        }
    }

}