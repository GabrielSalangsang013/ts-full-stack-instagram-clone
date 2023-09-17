import mongoose, { Schema } from 'mongoose';
import { Collection } from '../interfaces/instagramInterface.js';
import he from 'he';

const collectionSchema: Schema<Collection> = new Schema<Collection>({
    name: {
        type: String,
        trim: true,
        required: [true, 'Collection name is required'],
        minlength: [1, 'Collection name must be at least 1 character'],
        maxlength: [32, 'Collection name must not exceed 32 characters'],
        validate: [
            {
                validator: function(value: string) {
                    const sanitizedValue = he.escape(value);
                    return sanitizedValue === value;
                },
                message: 'Invalid characters detected',
            },
        ],
    },
    savedPosts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'SavePost'
        }
    ],
    user_id: {
        type: Schema.Types.ObjectId,
        select: false,
        ref: 'User'
    }
}, {timestamps: true, versionKey: false});

export default mongoose.model<Collection>('Collection', collectionSchema);