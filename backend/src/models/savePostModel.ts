import mongoose, { Schema } from 'mongoose';
import { SavePost } from '../interfaces/instagramInterface.js';

const savePostSchema: Schema<SavePost> = new Schema<SavePost>({
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        select: false,
        ref: 'User'
    }
}, {timestamps: true, versionKey: false});

export default mongoose.model<SavePost>('SavePost', savePostSchema);