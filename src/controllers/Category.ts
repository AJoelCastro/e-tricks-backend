import { Request, Response } from 'express';
import { CategoryRepository } from '../repositories/Category';
import { ICategoryRequest, ICategoryUpdateRequest } from '../interfaces/Category';

const categoryRepository = new CategoryRepository();

export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await categoryRepository.getAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching categories', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const category = await categoryRepository.getById(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};


export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name }: ICategoryRequest = req.body;

        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }

        const exists = await categoryRepository.exists(name);
        if (exists) {
            res.status(400).json({ message: 'Category already exists' });
            return;
        }

        const newCategory = await categoryRepository.create({ name });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error creating category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name }: ICategoryUpdateRequest = req.body;

        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }

        const updatedCategory = await categoryRepository.update(id, { name });
        if (!updatedCategory) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error updating category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedCategory = await categoryRepository.delete(id);

        if (!deletedCategory) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting category', 
            error: error instanceof Error ? error.message : error 
        });
    }
};