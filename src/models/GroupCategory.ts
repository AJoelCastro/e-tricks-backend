import mongoose, { Schema } from 'mongoose';
import { IGroupCategory } from '../interfaces/GroupCategory';

const GroupCategorySchema = new Schema<IGroupCategory>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
    },
    subcategories: [{
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    }],
    active: {
        type: Boolean,
        default: true
    },
    routeLink: {
        type: String,
        required: true,
    },
    brands: [{
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    versionKey: false
});


GroupCategorySchema.index({ name: 1, active: 1 });

export const GroupCategoryModel = mongoose.model<IGroupCategory>('GroupCategory', GroupCategorySchema);