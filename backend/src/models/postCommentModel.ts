import mongoose, { Schema } from 'mongoose';
import he from 'he';
import { PostComment } from '../interfaces/instagramInterface.js';

const postCommentSchema: Schema<PostComment> = new Schema<PostComment>({
    post_id: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    comment: {
        type: String,
        required: false,
        trim: true,
        maxlength: [200, 'Comment must not exceed 200 characters'],
        validate: [
            {
            validator: function(value: string) {
                const sanitizedValue = he.escape(value);
                return sanitizedValue === value;
            },
            message: 'Caption contains potentially unsafe characters or invalid characters',
            },
        ],
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'LikeComment'
        }
    ],
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true, versionKey: false});

export default mongoose.model<PostComment>('PostComment', postCommentSchema);