import { Document } from 'mongoose';

export interface IResenia extends Document{
  cliente: string;
  valoracion: number;
  comentario: string;
}