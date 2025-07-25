import { IAddress } from "../interfaces/Address";
import { IUserRequest } from "../interfaces/User";
import { UserModel } from "../models/User";
import mongoose from 'mongoose';
export class UserRepository {
    async verifyExistUser (userId:string){
        try{
            return await UserModel.find({userId: userId});
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
            return await UserModel.findOne({ userId: userId })
                .select('favorites -_id')
                .populate({
                    path: 'favorites',
                    populate: [
                    { path: 'brand', select: 'name' },
                    { path: 'category', select: 'name' },
                    { path: 'material', select: 'name' }
                    ]
                });
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
    async removeCartItem (userId:string, idCartItem:string){
        try {
            return await UserModel.updateOne({userId: userId}, { $pull: { cart: { _id: new mongoose.Types.ObjectId(idCartItem) } } });
        } catch (error) {
            throw error;
        }
    }

    async getAddresses(userId: string) {
        try {
            const user = await UserModel.findOne({ userId }).select('addresses -_id');
            return user?.addresses ?? [];
        } catch (error) {
            throw error;
        }
    }

    async addAddress(userId: string, address: IAddress) {
        try {
            return await UserModel.updateOne(
            { userId },
            { $push: { addresses: address } }
            );
        } catch (error) {
            throw error;
        }
    }

    async updateAddress(userId: string, addressId: string, address: Partial<IAddress>) {
        try {
            return await UserModel.updateOne(
            { userId, 'addresses._id': addressId },
            { $set: { 'addresses.$': { ...address, _id: addressId } } }
            );
        } catch (error) {
            throw error;
        }
    }

    async deleteAddress(userId: string, addressId: string) {
        try {
            return await UserModel.updateOne(
            { userId },
            { $pull: { addresses: { _id: addressId } } }
            );
        } catch (error) {
            throw error;
        }
    }

      async getUserWithCart(userId: string) {
        try {
            return await UserModel.findOne({ userId })
                .populate('cart.productId')
                .exec();
        } catch (error) {
            throw error;
        }
    }

    async clearUserCart(userId: string) {
        try {
            return await UserModel.updateOne(
                { userId },
                { $set: { cart: [] } }
            );
        } catch (error) {
            throw error;
        }
    }

}
