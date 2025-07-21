import { IMaterialRequest } from "../interfaces/Material";
import { MaterialModel } from "../models/Material";

export class MaterialRepository {
    async create(data: IMaterialRequest) {
        try {
            const newMaterial = await MaterialModel.create(data);
            return newMaterial;
        } catch (error) {
            throw new Error("Error creando material: " + (error instanceof Error ? error.message : error));
        }
    }
    async getAll() {
        try {
            return await MaterialModel.find();
        } catch (error) {
            throw new Error("Error obteniendo materiales: " + (error instanceof Error ? error.message : error));
        }
    }
    async getById(id: string) {
        try {
            const material = await MaterialModel.findById(id);
            if (!material) {
                throw new Error("Material no encontrado");
            }
            return material;
        } catch (error) {
            throw new Error("Error obteniendo material: " + (error instanceof Error ? error.message : error));
        }
    }
       
    async update(id: string, data: IMaterialRequest) {
        try {
            const updatedMaterial = await MaterialModel.findByIdAndUpdate(id, data, { new: true });
            if (!updatedMaterial) {
                throw new Error("Material no encontrado");
            }
            return updatedMaterial;
        } catch (error) {
            throw new Error("Error actualizando material: " + (error instanceof Error ? error.message : error));
        }
    }
    async delete(id: string) {
        try {
            const deletedMaterial = await MaterialModel.findByIdAndDelete(id);
            if (!deletedMaterial) {
                throw new Error("Material no encontrado");
            }
            return deletedMaterial;
        } catch (error) {
            throw new Error("Error eliminando material: " + (error instanceof Error ? error.message : error));
        }
    }
    async exists(name: string) {
        try {
            const material = await MaterialModel.findOne({ name });
            return !!material;
        } catch (error) {
            throw new Error("Error verificando existencia de material: " + (error instanceof Error ? error.message : error));
        }
    }
}