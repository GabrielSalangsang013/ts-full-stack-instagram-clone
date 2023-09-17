import mongoose, { Schema } from 'mongoose';
import { LikeComment } from '../interfaces/instagramInterface.js';

const likeCommentSchema: Schema<LikeComment> = new Schema<LikeComment>({
    comment_id: {
        type: Schema.Types.ObjectId,
        ref: 'PostComment'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        select: false,
        ref: 'User'
    }
}, {timestamps: true, versionKey: false});

export default mongoose.model<LikeComment>('LikeComment', likeCommentSchema);