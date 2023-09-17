import mongoose, { Schema } from 'mongoose';
import { Following } from '../interfaces/instagramInterface.js';

const followingSchema: Schema<Following> = new Schema<Following>({
    profile_id: {
        type: Schema.Types.ObjectId,
        ref: 'Profile'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        select: false,
        ref: 'User'
    }
}, {timestamps: true, versionKey: false});

export default mongoose.model<Following>('Following', followingSchema);