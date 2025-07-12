import { IUserRequest } from "../interfaces/User";
import { UserModel } from "../models/User";

export class UserRepository {
    async verifyExistFavoritesList (clerckId:string){
        try{
            return await UserModel.findOne({idClerk: clerckId})
        }catch(error){
            throw error
        }
    }
}