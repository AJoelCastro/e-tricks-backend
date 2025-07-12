import { IUserRequest } from "../interfaces/User";
import { UserModel } from "../models/User";

export class UserRepository {
    async verifyExistFavoritesList (clerckId:string){
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
}