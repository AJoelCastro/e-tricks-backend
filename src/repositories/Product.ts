import { IProductRequest } from "../interfaces/Product";
import { ProductModel } from "../models/Product";

export class ProductRepository {
    async getAll(){
        try{
            return await ProductModel.find().populate('material', 'name').populate('category', 'name').populate('brand', 'name');
        } catch (error) {
            throw error;
        }
    }
    async getById(id:string){
        try {
            return await ProductModel.findById(id).populate('material', 'name').populate('category', 'name').populate('brand', 'name');
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