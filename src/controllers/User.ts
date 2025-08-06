import { Request, Response } from "express";
import { UserRepository } from "../repositories/User";
import { IUserRequest } from "../interfaces/User";

const userRepository = new UserRepository();

export const createFavoriteCartList = async (data: IUserRequest) =>{
    try {
        return await userRepository.createFavoriteCartList(data);
    } catch (error) {
        console.error('Error in createFavoriteCartList:', error);
        throw error;
    }
}

export const verifyUser = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId;
        if(!userId){
            res.status(400).json({message: 'El id del usuario es obligatorio'});
            return;
        }
        
        const data: IUserRequest = {
            userId: userId,
            favorites: [],
            cart: []
        }
        
        const verify = await userRepository.verifyExistUser(userId);
        if(verify === null || verify.length === 0){
            const dataCreate = await createFavoriteCartList(data);
            res.status(201).json(dataCreate);
            return;
        }
        res.status(200).json(verify);
    } catch (error) {
        console.error('Error in verifyUser:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
}

export const getFavorites = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId;
        if(!userId){
            res.status(400).json({message: 'El id del usuario es obligatorio'});
            return;
        }
        
        const dataFavorites = await userRepository.getFavorites(userId);
        if (!dataFavorites || dataFavorites.favorites.length === 0) {
            res.status(200).json([]);
            return;
        }
        res.status(200).json(dataFavorites.favorites);
    } catch (error) {
        console.error('Error in getFavorites:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
}

export const getFavoriteIds = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId;
        if(!userId){
            res.status(400).json({message: 'El id del usuario es obligatorio'});
            return;
        }
        
        const dataFavorites = await userRepository.getFavoriteIds(userId);
        res.status(200).json(dataFavorites);
    } catch (error) {
        console.error('Error in getFavoriteIds:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
}

export const addFavorite = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId;
        const {idProduct} = req.body;
        
        if(!userId || !idProduct){
            res.status(400).json({message: 'El id del usuario y el id del producto son obligatorios'});
            return;
        }
        
        const dataAdd = await userRepository.addFavorite(userId, idProduct);
        res.status(201).json(dataAdd);
    } catch (error) {
        console.error('Error in addFavorite:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
}

export const removeFavorite = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId;
        const {idProduct} = req.body;
        
        if(!userId || !idProduct){
            res.status(400).json({message: 'El id del usuario y el id del producto son obligatorios'});
            return;
        }
        
        const dataRemove = await userRepository.removeFavorite(userId, idProduct);
        if (dataRemove.modifiedCount === 0) {
            res.status(404).json({ message: 'No se encontró el favorito para eliminar o ya fue eliminado' });
            return;
        }

        res.status(200).json({ message: 'Favorito eliminado correctamente', result: dataRemove });
    } catch (error) {
        console.error('Error in removeFavorite:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
}

export const getCartItems = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId;
        if(!userId){
            res.status(400).json({message: 'El id del usuario es obligatorio'});
            return;
        }
        
        const dataCart = await userRepository.getCartItems(userId);
        if (!dataCart || dataCart.cart.length === 0) {
            res.status(200).json([]);
            return;
        }
        res.status(200).json(dataCart.cart);
    } catch (error) {
        console.error('Error in getCartItems:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
}

export const addCartItem = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId;
        const { idProduct, quantity, size } = req.body;
        
        console.log('Received cart item data:', { userId, idProduct, quantity, size });
        
        // Validaciones más específicas
        if(!userId){
            res.status(400).json({message: 'El id del usuario es obligatorio'});
            return;
        }
        
        if(!idProduct){
            res.status(400).json({message: 'El id del producto es obligatorio'});
            return;
        }
        
        if(!quantity || quantity <= 0){
            res.status(400).json({message: 'La cantidad debe ser mayor a 0'});
            return;
        }
        
        if(!size){
            res.status(400).json({message: 'La talla es obligatoria'});
            return;
        }
        
        // Convertir quantity a número si viene como string
        const numericQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;
        
        // Convertir size a string si viene como número
        const stringSize = typeof size === 'number' ? size.toString() : size;
        
        console.log('Processing with:', { userId, idProduct, quantity: numericQuantity, size: stringSize });
        
        const dataAdd = await userRepository.addCartItem(userId, idProduct, numericQuantity, stringSize);
        
        console.log('Cart item added successfully:', dataAdd);
        res.status(201).json(dataAdd);
    } catch (error) {
        console.error('Error in addCartItem:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export const removeCartItem = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId;
        const {idCartItem} = req.body;
        
        if(!userId || !idCartItem){
            res.status(400).json({message: 'El id del usuario y el id del item del carrito son obligatorios'});
            return;
        }
        
        const dataRemove = await userRepository.removeCartItem(userId, idCartItem);
        if (dataRemove.modifiedCount === 0) {
            res.status(404).json({ message: 'No se encontró el item del carrito para eliminar o ya fue eliminado' });
            return;
        }

        res.status(200).json({ message: 'Item del carrito eliminado correctamente', result: dataRemove });
    } catch (error) {
        console.error('Error in removeCartItem:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
}

export const updateQuantityCartItem = async (req: Request, res: Response): Promise<void> =>{
    try {
        const userId = req.params.userId;
        const {idCartItem, quantity} = req.body;
        
        if(!userId || !idCartItem || !quantity){
            res.status(400).json({message: 'El id del usuario, el id del item del carrito y la cantidad son obligatorios'});
            return;
        }
        
        const dataUpdate = await userRepository.updateQuantityCartItem(userId, idCartItem, quantity);
        res.status(200).json(dataUpdate);
    } catch (error) {
        console.error('Error in updateQuantityCartItem:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
}

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
        res.status(400).json({ message: 'ID requerido' });
        return;
    }
    const data = await userRepository.getAddresses(userId);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in getAddresses:', error);
    res.status(500).json({ message: 'Error interno', error });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { address } = req.body;
    if (!userId || !address) {
        res.status(400).json({ message: 'Datos faltantes' });
        return;
    }

    const result = await userRepository.addAddress(userId, address);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in addAddress:', error);
    res.status(500).json({ message: 'Error interno', error });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    const update = req.body;
    if (!userId || !addressId) {
        res.status(400).json({ message: 'Datos faltantes' });
        return;
    }
    const result = await userRepository.updateAddress(userId, addressId, update);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in updateAddress:', error);
    res.status(500).json({ message: 'Error interno', error });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    if (!userId || !addressId) {
        res.status(400).json({ message: 'Datos faltantes' });
        return;
    }
    const result = await userRepository.deleteAddress(userId, addressId);
    res.status(200).json({ message: 'Dirección eliminada correctamente', result });
  } catch (error) {
    console.error('Error in deleteAddress:', error);
    res.status(500).json({ message: 'Error interno', error });
  }
};