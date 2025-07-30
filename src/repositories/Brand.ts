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
                            name: "$brand.name", // o cualquier otro campo que tenga Brand
                            image: "$brand.image"
                        },
                        categories: {
                            _id: 1,
                            name: 1, // o los campos que necesites de Category
                            image: 1,
                            routeLink: 1
                        }
                    }
                }
            ]);

            return result;
        } catch (error) {
            throw error;
        }
    }

    async getBrandsWithCategoryProductsWithProducts() {
        try {
            const result = await ProductModel.aggregate([
                // Primer paso: agrupar productos por brand y category
                {
                    $group: {
                        _id: {
                            brand: "$brand",
                            category: "$category"
                        },
                        products: {
                            $push: {
                                _id: "$_id",
                                name: "$name",
                                image: "$image",
                                routeLink: "$routeLink",
                                price: "$price",
                                discountPrice: "$discountPrice",
                                descuento: "$descuento"
                            }
                        }
                    }
                },
                // Segundo paso: agrupar por brand y construir el array de categorías con sus productos
                {
                    $group: {
                        _id: "$_id.brand",
                        categories: {
                            $push: {
                                categoryId: "$_id.category",
                                products: "$products"
                            }
                        }
                    }
                },
                // Lookup para obtener información de la marca
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
                // Lookup para obtener información de las categorías
                {
                    $lookup: {
                        from: "productcategories",
                        localField: "categories.categoryId",
                        foreignField: "_id",
                        as: "categoryDetails"
                    }
                },
                // Reestructurar para combinar la información de categorías con sus productos
                {
                    $addFields: {
                        categories: {
                            $map: {
                                input: "$categories",
                                as: "cat",
                                in: {
                                    $mergeObjects: [
                                        {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$categoryDetails",
                                                        cond: { $eq: ["$$this._id", "$$cat.categoryId"] }
                                                    }
                                                },
                                                0
                                            ]
                                        },
                                        { products: "$$cat.products" }
                                    ]
                                }
                            }
                        }
                    }
                },
                // Proyección final
                {
                    $project: {
                        _id: 0,
                        brand: {
                            _id: "$brand._id",
                            name: "$brand.name",
                            image: "$brand.image"
                        },
                        categories: {
                            _id: 1,
                            name: 1,
                            image: 1,
                            routeLink: 1,
                            products: {
                                _id: 1,
                                name: 1,
                                image: 1,
                                routeLink: 1,
                                price: 1,
                                discountPrice: 1,
                                descuento: 1
                            }
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