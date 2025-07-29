import { IBannerPrincipalRequest } from "../interfaces/BannerPrincipal";
import { BannerPrincipalModel } from "../models/BannerPrincipal";

export class BannerPrincipalRepository{
    async create(data: IBannerPrincipalRequest){
        return await BannerPrincipalModel.create(data);
    }

    async update(id: string, data: IBannerPrincipalRequest){
        return await BannerPrincipalModel.findByIdAndUpdate(id, data, { new: true });
    }

    async updateStatus(id: string, status: boolean){
        return await BannerPrincipalModel.findByIdAndUpdate(id, { status }, { new: true });
    }

    async getAll(){
        return await BannerPrincipalModel.find({ status: true });
    }

    async getById(id: string){
        return await BannerPrincipalModel.findById(id).populate('links');
    }

    async delete(id: string){
        return await BannerPrincipalModel.findByIdAndDelete(id);
    }
}