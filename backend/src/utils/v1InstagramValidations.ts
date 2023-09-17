import Joi from 'joi';
import he from 'he';
import { ValidationResult } from '../interfaces/index.js';

export function getUserProfileValidate(username: string) {
    const schema = Joi.object({
        username: Joi.string()
            .required()
            .trim()
            .min(4)
            .max(20)
            .pattern(/^[a-zA-Z0-9_]+$/)
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('username-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Username must be a string',
                'string.empty': 'Username is required',
                'string.min': 'Username must be at least 4 characters',
                'string.max': 'Username must not exceed 20 characters',
                'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
                'any.required': 'Username is required',
                'username-security': 'Username should not contain sensitive information',
                'username-xss-nosql': 'Invalid characters detected',
            })
    });

    return schema.validate({ username });
}

export function createNewPostValidate(caption: string, alt_text: string): ValidationResult {
    const schema = Joi.object({
        caption: Joi.string()
            .empty('')
            .trim()
            .max(2200)
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('caption-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Caption must be a string',
                'string.max': 'Caption must not exceed 2200 characters',
                'caption-xss-nosql': 'Caption contains potentially unsafe characters or invalid characters',
            })
            .optional(),
        alt_text: Joi.string()
            .empty('')
            .trim()
            .max(255)
            .empty('')
            .regex(/^[a-zA-Z0-9_ \-\.!@#$%^&*()+=?/\\[\]{}|~<>]+$/)
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('alt-text-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'alt text must be a string',
                'string.max': 'alt text must not exceed 255 characters',
                'string.pattern.base': 'Alt text must valid alt text only. Use valid characters.',
                'alt-text-xss-nosql': 'alt text contains potentially unsafe characters or invalid characters',
            })
    });
    
    return schema.validate({caption, alt_text});
}

export function getUserPostValidate(post_id: string) {
    const schema = Joi.object({
        post_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('post-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Post id must be a string',
                'post-id-xss-nosql': 'Post id contains potentially unsafe characters or invalid characters',
            })
    });
    
    return schema.validate({post_id});
}

export function postCommentValidate(post_id: string, comment: string) {
    const schema = Joi.object({
        post_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('post-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Post id must be a string',
                'post-id-xss-nosql': 'Post id contains potentially unsafe characters or invalid characters',
            }),
        comment: Joi.string()
            .trim()
            .max(200)
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('comment-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Comment must be a string',
                'string.max': 'Comment must not exceed 200 characters',
                'comment-xss-nosql': 'Comment contains potentially unsafe characters or invalid characters',
            })
    });
    
    return schema.validate({post_id, comment});
}

export function followProfileValidate(profile_id: string) {
    const schema = Joi.object({
        profile_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('profile-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Profile id must be a string',
                'profile-id-xss-nosql': 'Profile id contains potentially unsafe characters or invalid characters',
            })
    });
    
    return schema.validate({profile_id});
}

export function unfollowProfileValidate(profile_id: string) {
    const schema = Joi.object({
        profile_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('profile-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Profile id must be a string',
                'profile-id-xss-nosql': 'Profile id contains potentially unsafe characters or invalid characters',
            })
    });
    
    return schema.validate({profile_id});
}

export function likePostValidate(post_id: string) {
    const schema = Joi.object({
        post_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('post-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Post id must be a string',
                'post-id-xss-nosql': 'Post id contains potentially unsafe characters or invalid characters',
            })
    });

    return schema.validate({post_id});
}

export function unlikePostValidate(post_id: string) {
    const schema = Joi.object({
        post_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('post-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Post id must be a string',
                'post-id-xss-nosql': 'Post id contains potentially unsafe characters or invalid characters',
            })
    });

    return schema.validate({post_id});
}

export function deletePostCommentValidate(post_id: string, comment_id: string) {
    const schema = Joi.object({
        post_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('post-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Post id must be a string',
                'post-id-xss-nosql': 'Post id contains potentially unsafe characters or invalid characters',
            }),
        comment_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('comment-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Comment id must be a string',
                'comment-id-xss-nosql': 'Comment id contains potentially unsafe characters or invalid characters',
            })
    });

    return schema.validate({post_id, comment_id});
}

export function searchUsersByUsernameValidate(username: string) {
    const schema = Joi.object({
        username: Joi.string()
            .required()
            .trim()
            .min(4)
            .max(20)
            .pattern(/^[a-zA-Z0-9_]+$/)
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('username-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Username must be a string',
                'string.empty': 'Username is required',
                'string.min': 'Username must be at least 4 characters',
                'string.max': 'Username must not exceed 20 characters',
                'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
                'any.required': 'Username is required',
                'username-security': 'Username should not contain sensitive information',
                'username-xss-nosql': 'Invalid characters detected',
            })
    });

    return schema.validate({ username });
}

export function getFollowingByUsernameValidate(username: string) {
    const schema = Joi.object({
        username: Joi.string()
            .required()
            .trim()
            .min(4)
            .max(20)
            .pattern(/^[a-zA-Z0-9_]+$/)
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('username-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Username must be a string',
                'string.empty': 'Username is required',
                'string.min': 'Username must be at least 4 characters',
                'string.max': 'Username must not exceed 20 characters',
                'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
                'any.required': 'Username is required',
                'username-security': 'Username should not contain sensitive information',
                'username-xss-nosql': 'Invalid characters detected',
            })
    });

    return schema.validate({ username });
}

export function getFollowersByProfileIdValidate(profile_id: string) {
    const schema = Joi.object({
        profile_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('profile-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Profile id must be a string',
                'profile-id-xss-nosql': 'Profile id contains potentially unsafe characters or invalid characters',
            })
    });
    
    return schema.validate({profile_id});
}

export function removeFollowerValidate(user_id: string) {
    const schema = Joi.object({
        user_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('user-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'User id must be a string',
                'user-id-xss-nosql': 'User id contains potentially unsafe characters or invalid characters',
            })
    });
    
    return schema.validate({user_id});
}

export function updateProfileValidate(fullName: string, username: string, link: string, bio: string) {
    const schema = Joi.object({
        fullName: Joi.string()
            .required()
            .trim()
            .max(50)
            .pattern(/^[A-Za-z.\s]+$/)
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);

                if (sanitizedValue === value) {
                    return value;
                } else {
                    return helpers.error('any.invalid');
                }
            })
            .messages({
                'string.base': 'Full Name must be a string',
                'string.empty': 'Full Name is required',
                'string.max': 'Full Name must not exceed 50 characters',
                'string.pattern.base': 'Full Name must contain letters and dots only',
                'any.invalid': 'Full Name contains potentially unsafe characters or invalid characters',
            }),
        username: Joi.string()
            .required()
            .trim()
            .min(4)
            .max(20)
            .pattern(/^[a-zA-Z0-9_]+$/)
            .custom((value, helpers) => {
                if (/\b(admin|root|superuser)\b/i.test(value)) {
                    return helpers.error('any.invalid');
                }
                const sanitizedValue = he.escape(value);
                if (sanitizedValue === value) {
                    return value;
                } else {
                    return helpers.error('any.invalid');
                }
            })
            .messages({
                'string.base': 'Username must be a string',
                'string.empty': 'Username is required',
                'string.min': 'Username must be at least 4 characters',
                'string.max': 'Username must not exceed 20 characters',
                'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
                'any.invalid': 'Username contains sensitive information or invalid characters',
            }),
        link: Joi.string()
            .trim()
            .pattern(/^([a-zA-Z]+:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:(\d+))?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i)
            .message('Link must be a valid link'),
        bio: Joi.string()
            .allow('')
            .max(150)
            .custom((value, helpers) => {
                if (value === undefined || value === '') {
                    return value;
                } else {
                    const sanitizedValue = he.escape(value);
                    if (sanitizedValue === value) {
                        return value;
                    } else {
                        return helpers.error('any.invalid');
                    }
                }
            })
            .messages({
                'string.base': 'Bio must be a string',
                'string.max': 'Bio must not exceed 150 characters',
                'any.invalid': 'Invalid characters detected in Bio',
            }),
    });

    return schema.validate({fullName, username, link, bio});
}

export function updatePasswordValidate(oldPassword: string, newPassword: string, repeatNewPassword: string) {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .required()
            .min(12)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).+$/)
            .custom((value, helpers) => {
                if (/\b(password|123456789)\b/i.test(value)) {
                    return helpers.error('old-password-security');
                }
                return value;
            })
            .messages({
                'string.base': 'Old Password must be a string',
                'string.empty': 'Old Password is required',
                'string.min': 'Old Password must be at least 12 characters',
                'string.pattern.base': 'Old Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
                'any.required': 'Old Password is required',
                'password-security': 'Old Password should not be commonly used or easily guessable',
            }),
        newPassword: Joi.string()
            .required()
            .min(12)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).+$/)
            .custom((value, helpers) => {
                if (/\b(password|123456789)\b/i.test(value)) {
                    return helpers.error('new-password-security');
                }
                return value;
            })
            .messages({
                'string.base': 'New Password must be a string',
                'string.empty': 'New Password is required',
                'string.min': 'New Password must be at least 12 characters',
                'string.pattern.base': 'New Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
                'any.required': 'New Password is required',
                'password-security': 'New Password should not be commonly used or easily guessable',
            }),
        repeatNewPassword: Joi.string()
            .required()
            .valid(Joi.ref('newPassword'))
            .messages({
                'any.only': 'Passwords must match',
                'any.required': 'Please repeat your password',
            }),
    });

    return schema.validate({ oldPassword, newPassword, repeatNewPassword });
}

export function deletePostValidate(post_id: string) {
    const schema = Joi.object({
        post_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('post-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Post id must be a string',
                'post-id-xss-nosql': 'Post id contains potentially unsafe characters or invalid characters',
            })
    });

    return schema.validate({post_id});
}

export function updatePostValidate(post_id: string, caption: string, alt_text: string) {
    const schema = Joi.object({
        post_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('post-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Post id must be a string',
                'post-id-xss-nosql': 'Post id contains potentially unsafe characters or invalid characters',
            }),
        caption: Joi.string()
            .empty('')
            .trim()
            .max(2200)
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('caption-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Caption must be a string',
                'string.max': 'Caption must not exceed 2200 characters',
                'caption-xss-nosql': 'Caption contains potentially unsafe characters or invalid characters',
            })
            .optional(),
        alt_text: Joi.string()
            .empty('')
            .trim()
            .max(255)
            .empty('')
            .regex(/^[a-zA-Z0-9_ \-\.!@#$%^&*()+=?/\\[\]{}|~<>]+$/)
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('alt-text-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'alt text must be a string',
                'string.max': 'alt text must not exceed 255 characters',
                'string.pattern.base': 'Alt text must valid alt text only. Use valid characters.',
                'alt-text-xss-nosql': 'alt text contains potentially unsafe characters or invalid characters',
            })
    });

    return schema.validate({post_id, caption, alt_text});
}

export function likeCommentValidate(comment_id: string) {
    const schema = Joi.object({
        comment_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('comment-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Comment id must be a string',
                'comment-id-xss-nosql': 'Comment id contains potentially unsafe characters or invalid characters',
            })
    });

    return schema.validate({comment_id});
}

export function unlikeCommentValidate(comment_id: string) {
    const schema = Joi.object({
        comment_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('comment-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Comment id must be a string',
                'comment-id-xss-nosql': 'Comment id contains potentially unsafe characters or invalid characters',
            })
    });

    return schema.validate({comment_id});
}

export function getAllUsersWhoLikeSpecificCommentValidate(comment_id: string) {
    const schema = Joi.object({
        comment_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('comment-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Comment id must be a string',
                'comment-id-xss-nosql': 'Comment id contains potentially unsafe characters or invalid characters',
            })
    });

    return schema.validate({comment_id});
}

export function getAllUsersWhoLikePostValidate(post_id: string) {
    const schema = Joi.object({
        post_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('post-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Post id must be a string',
                'post-id-xss-nosql': 'Post id contains potentially unsafe characters or invalid characters',
            })
    });

    return schema.validate({post_id});
}

export function savePostValidate(post_id: string) {
    const schema = Joi.object({
        post_id: Joi.string()
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('post-id-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Post id must be a string',
                'post-id-xss-nosql': 'Post id contains potentially unsafe characters or invalid characters',
            })
    });

    return schema.validate({post_id});
}

export function getAllSavedPostsLimit4Validate(username: string) {
    const schema = Joi.object({
        username: Joi.string()
            .required()
            .trim()
            .min(4)
            .max(20)
            .pattern(/^[a-zA-Z0-9_]+$/)
            .custom((value, helpers) => {
                const sanitizedValue = he.escape(value);
                if (sanitizedValue !== value) {
                    return helpers.error('username-xss-nosql');
                }
                return value;
            })
            .messages({
                'string.base': 'Username must be a string',
                'string.empty': 'Username is required',
                'string.min': 'Username must be at least 4 characters',
                'string.max': 'Username must not exceed 20 characters',
                'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
                'any.required': 'Username is required',
                'username-security': 'Username should not contain sensitive information',
                'username-xss-nosql': 'Invalid characters detected',
            })
    });

    return schema.validate({ username });
}