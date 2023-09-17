import mongoose, { Schema } from 'mongoose';
import { LikePost } from '../interfaces/instagramInterface.js';

const likePostSchema: Schema<LikePost> = new Schema<LikePost>({
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

export default mongoose.model<LikePost>('LikePost', likePostSchema);