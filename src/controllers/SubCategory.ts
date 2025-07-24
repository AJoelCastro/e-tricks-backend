import { Request, Response } from 'express';
import { SubCategoryRepository } from '../repositories/SubCategory';
import { 
    ISubCategoryRequest, 
    ISubCategoryUpdateRequest 
} from '../interfaces/SubCategory';

const subCategoryRepository = new SubCategoryRepository();

export const getSubCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const subCategories = await subCategoryRepository.getAll(activeOnly);
        res.status(200).json(subCategories);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching group subcategories', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const getSubCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const subCategory = await subCategoryRepository.getById(req.params.id);
        if (!subCategory) {
            res.status(404).json({ message: 'SubGroup category not found' });
            return;
        }
        res.status(200).json(subCategory);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching group category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const createSubCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const data: ISubCategoryRequest = req.body;

        if (!data.name ||  !data.productcategories ||  data.productcategories.length === 0  ) {
            res.status(400).json({ 
                message: 'Name and at least one brand are required' 
            });
            return;
        }

        const exists = await subCategoryRepository.exists(data.name);
        if (exists) {
            res.status(400).json({ message: 'Sub category with this name already exists' });
            return;
        }

        const newSubCategory = await subCategoryRepository.create(data);
        res.status(201).json(newSubCategory);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error creating Sub category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const updateSubCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data: ISubCategoryUpdateRequest = req.body;

        if ((data.productcategories && data.productcategories.length === 0) || !data.image ) {
            res.status(400).json({ message: 'Must include at least one category' });
            return;
        }

        const updatedSubCategory = await subCategoryRepository.update(id, data);
        if (!updatedSubCategory) {
            res.status(404).json({ message: 'Sub category not found' });
            return;
        }

        res.status(200).json(updatedSubCategory);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error updating sub category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const toggleSubCategoryStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const subCategory = await subCategoryRepository.toggleStatus(id);

        if (!subCategory) {
            res.status(404).json({ message: 'Sub category not found' });
            return;
        }

        res.status(200).json({
            message: `Sub category ${subCategory.active ? 'activated' : 'deactivated'}`,
            subCategory
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error toggling sub category status', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const deleteSubCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedGroupCategory = await subCategoryRepository.delete(id);

        if (!deletedGroupCategory) {
            res.status(404).json({ message: 'Group category not found' });
            return;
        }

        res.status(200).json({ message: 'Group category deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting group category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const getCategoriesFromGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const subcategories = await subCategoryRepository.getCategoriesFromGroup(id);
        
        res.status(200).json({
            success: true,
            data: subcategories
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching categories from group', 
            error: error instanceof Error ? error.message : error 
        });
    }
};



export const getProductsBySubCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;    
        const products = await subCategoryRepository.getProductsByGroupCategory(id);

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching products for group category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};