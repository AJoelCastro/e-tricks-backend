import { IProductRequest } from "../interfaces/Product";
import { ProductModel } from "../models/Product";
import { UserModel } from "../models/User";

export class ProductRepository {
    async getAll(){
        try{
            return await ProductModel.find().populate('material', 'name').populate('category', 'name').populate('brand', 'name');
        } catch (error) {
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const product = await ProductModel.findById(id)
                .populate('material', 'name')
                .populate('category', 'name')
                .populate('brand', 'name')
                .lean();

            if (!product) return null;

            if (product.resenias?.length) {
                // 1️⃣ Extraer todos los userId únicos de las reseñas
                const userIds = [...new Set(product.resenias.map((r: any) => r.userId))];

                // 2️⃣ Buscar todos los usuarios de una sola vez
                const users = await UserModel.find(
                    { userId: { $in: userIds } },
                    { userId: 1, 'personalInfo.name': 1 }
                ).lean();

                // Convertir el array de usuarios en un mapa para búsqueda rápida
                const userMap = new Map(users.map(u => [u.userId, u]));

                // 3️⃣ Asignar el nombre del usuario a cada reseña
                product.resenias = product.resenias.map((resenia: any) => ({
                    ...resenia,
                    user: userMap.has(resenia.userId)
                        ? { name: userMap.get(resenia.userId)?.personalInfo?.name || '' }
                        : null
                }));
            }

            return product;
        } catch (error) {
            throw error;
        }
    }

    async create(product:IProductRequest){
        try {
            return await ProductModel.create(product);
        } catch (error) {
            throw error;
        }
    }

    async delete(id:string){
        try {
            return await ProductModel.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    }

    async update(id:string, product:IProductRequest){
        try {
            return await ProductModel.findByIdAndUpdate(id, product, { new: true });
        } catch (error) {
            throw error;
        }
    }

    async getByIdGroupByIdSubByIdCategoryProduct (idGroup:string, idSub:string, idCategory:string){
        try {
            return await ProductModel.find({groupCategory: idGroup,subCategory: idSub,category: idCategory}).populate('material', 'name').populate('category', 'name').populate('brand', 'name');
        } catch (error) {
            throw error;
        }
    }
    async getByIdGroupByIdSubProduct(idGroup: string, idSub: string) {
        try {
            return await ProductModel.find({
            groupCategory: idGroup,
            subCategory: idSub
            })
            .populate('material', 'name')
            .populate('category', 'name')
            .populate('brand', 'name');
        } catch (error) {
            throw error;
        }
    }

    async getProductsByIdMarcaAndIdCategoryProduct(idMarca: string, idCategory: string) {
        try {
            return await ProductModel.find({ brand: idMarca, category: idCategory }).populate('material', 'name').populate('category', 'name').populate('brand', 'name');
        } catch (error) {
            throw error;
        }
    }

    async getProductsByIdMarca(idMarca: string) {
        try {
            return await ProductModel.find({ brand: idMarca }).populate('material', 'name').populate('category', 'name').populate('brand', 'name');
        } catch (error) {
            throw error;
        }
    }

    async getProductsWithDescuento() {
        try {
            return await ProductModel.find({ descuento: { $gt: 0 } }).populate('material', 'name').populate('category', 'name').populate('brand', 'name');
        } catch (error) {
            throw error;
        }
    }

    async getNewProducts() {
        try {
            return await ProductModel.find({ isNew: true }).populate('material', 'name').populate('category', 'name').populate('brand', 'name');
        } catch (error) {
            throw error;
        }
    }

}