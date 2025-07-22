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
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }],
    active: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
    versionKey: false
});


GroupCategorySchema.index({ name: 1, active: 1 });

export const GroupCategoryModel = mongoose.model<IGroupCategory>('GroupCategory', GroupCategorySchema);