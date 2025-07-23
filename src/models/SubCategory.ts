import mongoose, { Schema } from 'mongoose';
import { ISubCategory } from '../interfaces/SubCategory';

const SubCategorySchema = new Schema<ISubCategory>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    productcategories: [{
        type: Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: true
    }],
    active: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        required: true,
    },
    mobileimage: {
        type: String,
        required: true,
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: false,
    versionKey: false
});


SubCategorySchema.index({ name: 1, active: 1 });

export const SubCategoryModel = mongoose.model<ISubCategory>('SubCategory', SubCategorySchema);