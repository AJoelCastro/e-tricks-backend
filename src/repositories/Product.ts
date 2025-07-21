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
}