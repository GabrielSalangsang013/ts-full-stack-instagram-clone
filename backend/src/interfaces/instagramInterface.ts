import { Document } from 'mongoose';
import { User } from '../interfaces/index.js';

export interface Post extends Document {
    post: any;
    caption: string;
    alt_text: string;
    viewers: [string];
    profile_id: string | any;
    user_id: string | any;
    likes: [string];
    comments: [string];
}

export interface Follower extends Document {
    profile_id: string | any;
    user_id: string | any;
}

export interface Following extends Document {
    profile_id: string | any;
    user_id: string | any;
}

export interface LikePost extends Document {
    post_id: string | any;
    user_id: string | any;
}

export interface PostComment extends Document {
    post_id: string | any;
    comment: string;
    likes: [string];
    user_id: string | any;
}

export interface LikeComment extends Document {
    comment_id: string | any;
    user_id: string | any;
}

export interface SavePost extends Document {
    post_id: string | any;
    user_id: string | any;
}

export interface Collection extends Document {
    name: string;
    savedPosts: [string];
    user_id: User;
}