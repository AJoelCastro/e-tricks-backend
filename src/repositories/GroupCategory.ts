import { GroupCategoryModel } from '../models/GroupCategory';
import { ProductModel } from '../models/Product';
import { IGroupCategory, IGroupCategoryRequest, IGroupCategoryUpdateRequest } from '../interfaces/GroupCategory';

export class GroupCategoryRepository {
    async getAll(activeOnly: boolean = true): Promise<IGroupCategory[]> {
        const query = activeOnly ? { active: true } : {};
        return await GroupCategoryModel.find(query).populate('subcategories');
    }

    async getById(id: string): Promise<IGroupCategory | null> {
        return await GroupCategoryModel.findById(id).populate('subcategories');
    }

    async create(data: IGroupCategoryRequest): Promise<IGroupCategory> {
        return await GroupCategoryModel.create(data);
    }

    async update(id: string, data: IGroupCategoryUpdateRequest): Promise<IGroupCategory | null> {
        return await GroupCategoryModel.findByIdAndUpdate(
            id, 
            data, 
            { new: true }
        ).populate('subcategories');
    }

    async delete(id: string): Promise<IGroupCategory | null> {
        return await GroupCategoryModel.findByIdAndDelete(id);
    }

    async exists(name: string): Promise<boolean> {
        const groupCategory = await GroupCategoryModel.findOne({ name });
        return !!groupCategory;
    }

    async toggleStatus(id: string): Promise<IGroupCategory | null> {
        const groupCategory = await GroupCategoryModel.findById(id);
        if (!groupCategory) return null;
        
        groupCategory.active = !groupCategory.active;
        return await groupCategory.save();
    }

    async getSubCategoriesFromGroup(groupCategoryId: string): Promise<any[]> {
        const groupCategory = await GroupCategoryModel.findById(groupCategoryId)
            .populate('subcategories');
        
        if (!groupCategory) {
            throw new Error('Group category not found');
        }

        return groupCategory.subcategories;
    }

      

   
}