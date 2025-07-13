import { IUserRequest } from "../interfaces/User";
import { UserModel } from "../models/User";

export class UserRepository {
    async verifyExistUser (clerckId:string){
        try{
            return await UserModel.findOne({idClerk: clerckId});
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
    async addFavorite (clerckId:string, productId:string){
        try {
            return await UserModel.updateOne({idClerk: clerckId}, {$addToSet: {favorites: productId}});
        } catch (error) {
            throw error;
        }
    }
    async getFavorites (clerckId:string){
        try {
            return await UserModel.findOne({idClerk: clerckId}).populate('favorites').select('favorites -_id');
        } catch (error) {
            throw error;
        }
    }

    async getFavoriteIds(clerckId: string) {
        try {
            const result = await UserModel.findOne({ idClerk: clerckId })
            .select('favorites -_id')
            .lean(); // Retorna un objeto plano, no un documento de Mongoose

            return result?.favorites ?? [];
        } catch (error) {
            throw error;
        }
    }

    async addCartItem (clerckId:string, productId:string){
        try {
            return await UserModel.updateOne({idClerk: clerckId}, {$addToSet: {cart: productId}});
        } catch (error) {
            throw error;
        }
    }
    async getCartItems (clerckId:string){
        try {
            return await UserModel.findOne({idClerk: clerckId}, {cart: 1, _id: 0});
        } catch (error) {
            throw error;
        }
    }
    async removeFavorite (clerckId:string, productId:string){
        try {
            return await UserModel.updateOne({idClerk: clerckId}, {$pull: {favorites: productId}});
        } catch (error) {
            throw error;
        }
    }
    async removeCartItem (clerckId:string, productId:string){
        try {
            return await UserModel.updateOne({idClerk: clerckId}, {$pull: {cart: productId}});
        } catch (error) {
            throw error;
        }
    }

}
