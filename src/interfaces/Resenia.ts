import { Document } from 'mongoose';

export interface IResenia extends Document{
  userId: string;
  valoracion: number;
  comentario: string;
}