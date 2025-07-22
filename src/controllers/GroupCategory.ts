import { Request, Response } from 'express';
import { GroupCategoryRepository } from '../repositories/GroupCategory';
import { 
    IGroupCategoryRequest, 
    IGroupCategoryUpdateRequest 
} from '../interfaces/GroupCategory';

const groupCategoryRepository = new GroupCategoryRepository();

export const getGroupCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const activeOnly = req.query.activeOnly !== 'false';
        const groupCategories = await groupCategoryRepository.getAll(activeOnly);
        res.status(200).json(groupCategories);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching group categories', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const getGroupCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const groupCategory = await groupCategoryRepository.getById(req.params.id);
        if (!groupCategory) {
            res.status(404).json({ message: 'Group category not found' });
            return;
        }
        res.status(200).json(groupCategory);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching group category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const createGroupCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, categories, active,image }: IGroupCategoryRequest = req.body;

        if (!name || !categories || categories.length === 0) {
            res.status(400).json({ 
                message: 'Name and at least one category are required' 
            });
            return;
        }

        const exists = await groupCategoryRepository.exists(name);
        if (exists) {
            res.status(400).json({ message: 'Group category with this name already exists' });
            return;
        }

        const newGroupCategory = await groupCategoryRepository.create({ 
            name,
            description, 
            categories, 
            active: active ?? true ,
            image

        });
        res.status(201).json(newGroupCategory);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error creating group category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const updateGroupCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data: IGroupCategoryUpdateRequest = req.body;

        if (data.categories && data.categories.length === 0) {
            res.status(400).json({ message: 'Must include at least one category' });
            return;
        }

        const updatedGroupCategory = await groupCategoryRepository.update(id, data);
        if (!updatedGroupCategory) {
            res.status(404).json({ message: 'Group category not found' });
            return;
        }

        res.status(200).json(updatedGroupCategory);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error updating group category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const toggleGroupCategoryStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const groupCategory = await groupCategoryRepository.toggleStatus(id);

        if (!groupCategory) {
            res.status(404).json({ message: 'Group category not found' });
            return;
        }

        res.status(200).json({
            message: `Group category ${groupCategory.active ? 'activated' : 'deactivated'}`,
            groupCategory
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error toggling group category status', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const deleteGroupCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedGroupCategory = await groupCategoryRepository.delete(id);

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
        const categories = await groupCategoryRepository.getCategoriesFromGroup(id);
        
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching categories from group', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const getProductsByGroupCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;    
        const products = await groupCategoryRepository.getProductsByGroupCategory(id);

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