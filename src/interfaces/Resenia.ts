import { Document } from 'mongoose';

export interface IResenia extends Document{
  clienteId: string;
  valoracion: number;
  comentario: string;
}