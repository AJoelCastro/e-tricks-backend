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
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
  groupCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupCategory', required: true },
  images: { type: [String], default: [] },
  descuento: { type: Number, default: 0 },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  resenias: { type: [reseniaSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  isNewProduct: { type: Boolean, required: true},
  isTrending: { type: Boolean, default: false },
  season: { type: String, default: '' },
});


export const ProductModel = mongoose.model<IProduct>('Product', productSchema);