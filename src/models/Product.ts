import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../interfaces/Product';

const reseniaSchema = new Schema(
  {
    userId: { type: String, required: true },
    valoracion: { type: Number, required: true },
    comentario: { type: String, required: true }
  },
  { _id: false }
);
const stockPorTallaSchema = new Schema(
  {
    talla: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 }
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stockPorTalla: {
    type: [stockPorTallaSchema],
    required: true
  },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  category: { type: String, required: true },
  images: { type: [String], default: [] },
  descuento: { type: Number, default: 0 },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  resenias: { type: [reseniaSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});


export const ProductModel = mongoose.model<IProduct>('Product', productSchema);