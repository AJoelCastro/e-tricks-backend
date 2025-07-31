import { IProductCategoryRequest, IProductCategoryUpdateRequest, IProductCategory } from "../interfaces/ProductCategory";
import { ProductModel } from "../models/Product";
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

    async getAllWithDescuento() {
        try {
            const categoriasConDescuento = await ProductModel.aggregate([
                {
                    // Filtrar productos con descuento mayor a 0
                    $match: {
                        descuento: { $gt: 0 }
                    }
                },
                {
                    // Agrupar por categoría y calcular el máximo descuento
                    $group: {
                        _id: "$category",
                        maxDescuento: { $max: "$descuento" }
                    }
                },
                {
                    // Hacer lookup para obtener los datos completos de la categoría
                    $lookup: {
                        from: "productcategories", // nombre de la colección de categorías
                        localField: "_id",
                        foreignField: "_id",
                        as: "categoryData"
                    }
                },
                {
                    // Descomponer el array resultante del lookup
                    $unwind: "$categoryData"
                },
                {
                    // Combinar los datos de la categoría con el máximo descuento
                    $addFields: {
                        "categoryData.maxDescuento": "$maxDescuento"
                    }
                },
                {
                    // Proyectar solo los datos de la categoría con el campo adicional
                    $replaceRoot: {
                        newRoot: "$categoryData"
                    }
                },
                {
                    // Ordenar por nombre de categoría
                    $sort: {
                        name: 1
                    }
                }
            ]);

            return categoriasConDescuento;
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