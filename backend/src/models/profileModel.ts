import mongoose, { Schema } from 'mongoose';
import he from 'he';
import { Profile } from '../interfaces/index.js';
import * as userSettings from '../constants/v1AuthenticationUserSettings.js'; // * ALL USER SETTINGS

const profileSchema: Schema<Profile> = new Schema<Profile>({
  fullName: {
    type: String,
    trim: true,
    required: [true, 'Full Name is required'],
    maxlength: [50, 'Full Name must not exceed 50 characters'],
    match: [/^[A-Za-z.\s]+$/, 'Full Name must contain letters and dots only'],
    validate: [
      {
        validator: function(value: string) {
          const sanitizedValue = he.escape(value);
          return sanitizedValue === value;
        },
        message: 'Full Name contains potentially unsafe characters or invalid characters',
      },
    ],
  },
  profilePicture: {
    type: String,
    required: true,
    default: userSettings.DEFAULT_PROFILE_PICTURE
  },
  bio: {
    type: String,
    required: false,
    maxlength: [150, 'Bio must not exceed 150 characters'],
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
  link: {
    type: String,
    required: false,
    trim: true,
    validate: [
      {
        validator: function(value: string) {
          const pattern = new RegExp(
            '^([a-zA-Z]+:\\/\\/)?' + // CHECK PROTOCOL
              '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // CHECK DOMAIN NAME
              '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
              '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // CHECK PORT AND IT'S PATH
              '(\\?[;&a-z\\d%_.~+=-]*)?' + // QUERY STRING
              '(\\#[-a-z\\d_]*)?$', // FRAGMENT LOCATOR
            'i'
          );

          return pattern.test(value);
        },
        message: 'Link must be a valid link',
      }
    ]
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      select: false
    }
  ],
  user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      select: false
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Follower',
      select: false
    }
  ]
},{ timestamps: true, versionKey: false })

export default mongoose.model<Profile>('Profile', profileSchema);