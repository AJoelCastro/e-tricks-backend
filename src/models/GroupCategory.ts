import mongoose, { Schema } from 'mongoose';
import { IGroupCategory } from '../interfaces/GroupCategory';

const GroupCategorySchema = new Schema<IGroupCategory>({
    description: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});


GroupCategorySchema.index({ description: 1, active: 1 });

export const GroupCategoryModel = mongoose.model<IGroupCategory>('GroupCategory', GroupCategorySchema);