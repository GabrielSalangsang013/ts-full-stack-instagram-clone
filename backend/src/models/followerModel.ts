import mongoose, { Schema } from 'mongoose';
import { Follower } from '../interfaces/instagramInterface.js';

const followerSchema: Schema<Follower> = new Schema<Follower>({
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

export default mongoose.model<Follower>('Follower', followerSchema);