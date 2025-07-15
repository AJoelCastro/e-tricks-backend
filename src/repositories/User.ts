import { IUserRequest } from "../interfaces/User";
import { UserModel } from "../models/User";

export class UserRepository {
    async verifyExistUser (userId:string){
        try{
            return await UserModel.findOne({userId: userId});
        }catch(error){
            throw error;
        }
    }
    async createFavoriteCartList (data: IUserRequest){
        try {
            return await UserModel.create(data);
        } catch (error) {
            throw error;
        }
    }
    async addFavorite (userId:string, productId:string){
        try {
            return await UserModel.updateOne({userId: userId}, {$addToSet: {favorites: productId}});
        } catch (error) {
            throw error;
        }
    }
    async getFavorites (userId:string){
        try {
            return await UserModel.findOne({userId: userId}).populate('favorites').select('favorites -_id');
        } catch (error) {
            throw error;
        }
    }

    async getFavoriteIds(userId: string) {
        try {
            const result = await UserModel.findOne({ userId: userId })
            .select('favorites -_id')
            .lean(); // Retorna un objeto plano, no un documento de Mongoose

            return result?.favorites ?? [];
        } catch (error) {
            throw error;
        }
    }

    async addCartItem (userId:string, productId:string, quantity: number, size: string){
        try {
            return await UserModel.updateOne({userId: userId}, {$addToSet: {cart: {productId, quantity, size}}});
        } catch (error) {
            throw error;
        }
    }
    async getCartItems (userId:string){
        try {
            return await UserModel.findOne({userId: userId}).populate('cart').select('favorites -_id');
        } catch (error) {
            throw error;
        }
    }
    async removeFavorite (userId:string, productId:string){
        try {
            return await UserModel.updateOne({userId: userId}, {$pull: {favorites: productId}});
        } catch (error) {
            throw error;
        }
    }
    async removeCartItem (userId:string, productId:string){
        try {
            return await UserModel.updateOne({userId: userId}, {$pull: {cart: productId}});
        } catch (error) {
            throw error;
        }
    }

}
