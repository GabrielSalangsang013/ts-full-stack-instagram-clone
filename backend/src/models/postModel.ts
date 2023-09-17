import mongoose, { Schema } from 'mongoose';
import he from 'he';
import { Post } from '../interfaces/instagramInterface.js';

const postSchema: Schema<Post> = new Schema<Post>({
  post: {
    type: Array,
    required: true
  },
  caption: {
    type: String,
    required: false,
    trim: true,
    maxlength: [2200, 'Caption must not exceed 2200 characters'],
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
  alt_text: {
    type: String,
    required: false,
    trim: true,
    maxlength: [255, 'Alt text must not exceed 2200 characters'],
    match: [/^[A-Za-z0-9\s.,!?@#\$%\^&\*\(\)-_=\+;:'"<>\[\]\{\}/\\\|`~]+$/, 'Alt text must be valid Alt text'],
    validate: [
        {
          validator: function(value: string) {
            const sanitizedValue = he.escape(value);
            return sanitizedValue === value;
          },
          message: 'Alt text contains potentially unsafe characters or invalid characters',
        },
    ],
  },
  viewers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      select: false
    }
  ],
  profile_id: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    select: false
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    select: false
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      select: false
    }
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'PostComment',
      select: false
    }
  ]
},{ timestamps: true, versionKey: false })

export default mongoose.model<Post>('Post', postSchema);