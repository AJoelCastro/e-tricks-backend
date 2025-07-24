import { SubCategoryModel } from '../models/SubCategory';
import { ProductModel } from '../models/Product';
import { ISubCategory, ISubCategoryRequest, ISubCategoryUpdateRequest } from '../interfaces/SubCategory';

export class SubCategoryRepository {
    async getAll(activeOnly: boolean = true): Promise<ISubCategory[]> {
        const query = activeOnly ? { active: true } : {};
        return await SubCategoryModel.find(query).populate('productcategories');
    }

    async getById(id: string): Promise<ISubCategory | null> {
        return await SubCategoryModel.findById(id).populate('productcategories');
    }

    async create(data: ISubCategoryRequest): Promise<ISubCategory> {
        return await SubCategoryModel.create(data);
    }

    async update(id: string, data: ISubCategoryUpdateRequest): Promise<ISubCategory | null> {
        return await SubCategoryModel.findByIdAndUpdate(
            id, 
            data, 
            { new: true }
        ).populate('productcategories');
    }

    async delete(id: string): Promise<ISubCategory | null> {
        return await SubCategoryModel.findByIdAndDelete(id);
    }

    async exists(name: string): Promise<boolean> {
        const SubCategory = await SubCategoryModel.findOne({ name });
        return !!SubCategory;
    }

    async toggleStatus(id: string): Promise<ISubCategory | null> {
        const subCategory = await SubCategoryModel.findById(id);
        if (!subCategory) return null;
        
        subCategory.active = !subCategory.active;
        return await subCategory.save();
    }

    async getCategoriesFromGroup(subCategoryId: string): Promise<any[]> {
        const subCategory = await SubCategoryModel.findById(subCategoryId)
            .populate('productcategories');
        
        if (!subCategory) {
            throw new Error('Sub category not found');
        }

        return subCategory.productcategories;
    }

      

    async getProductsByGroupCategory(subcategoryId: string): Promise<any[]> {
        try{
            const subcategory = await SubCategoryModel.findById(subcategoryId);

            if (!subcategory) {
                throw new Error('Category not found');
            }

            const categoryIds = subcategory.productcategories.map((cat: any) => cat._id);

            const products = await ProductModel.find({
                category: { $in: categoryIds }
            })
                .populate('category')
                .populate('material')
                .populate('brand')
                .sort({ createdAt: -1 });

            return products;
        } catch (error) {
            throw error;
        }
    }
}