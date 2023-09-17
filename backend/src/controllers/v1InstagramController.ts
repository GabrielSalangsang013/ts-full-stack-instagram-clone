import express from 'express';
import lodash from 'lodash';
import xss from 'xss'; 
import mongoSanitize from 'express-mongo-sanitize';
import argon2 from 'argon2';

// * ----------------- MODELS -----------------
import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import Profile from '../models/profileModel.js';
import Follower from '../models/followerModel.js';
import Following from '../models/followingModel.js';
import LikePost from '../models/likePostModel.js';
import PostComment from '../models/postCommentModel.js'
import LikeComment from '../models/likeCommentModel.js';
import SavePost from '../models/savePostModel.js';
// * ----------------- MODELS -----------------

// * ----------------- UTILITIES -----------------
import tryCatch from "../utils/tryCatch.js"; // * FOR AVOIDING RETYPING TRY AND CATCH IN EACH CONTROLLER
import ErrorResponse from '../utils/ErrorResponse.js';
import * as cloudinaryFunctions from '../utils/cloudinaryFunctions.js';
import * as validations from '../utils/v1InstagramValidations.js';
import authenticatedUserFollowingWhoLikePost from '../utils/authenticatedUserFollowingWhoLikePost.js';
import isAuthenticatedUserLikeThisPost from '../utils/isAuthenticatedUserLikeThisPost.js';
import getAllCommentsAuthenticatedUserToThePost from '../utils/getAllCommentsAuthenticatedUserToThePost.js';
import callRedis from '../utils/callRedis.js';
// * ----------------- UTILITIES -----------------

// * ----------------- CONSTANTS -----------------
import * as instagramErrorCodes from '../constants/v1InstagramErrorCodes.js'; // * ALL INSTAGRAM ERROR CODES
import * as userSettings from '../constants/v1AuthenticationUserSettings.js'; // * ALL USER SETTINGS
// * ----------------- CONSTANTS -----------------

const redis = await callRedis();

const getUserProfileByUsername = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    
    let { username } = mongoSanitize.sanitize(req.params);
    if(!username) throw new ErrorResponse(400, 'Username is required.', instagramErrorCodes.NO_USERNAME_FOR_GET_PROFILE);

    username = xss(username);

    const { error } = validations.getUserProfileValidate(username);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_GET_USER_PROFILE_VALIDATION);

    let existingProfile: any = await User.findOne({username: username}).select('-_id username profile following').populate({
        select: 'profilePicture posts user_id fullName followers link bio',
        path: 'profile'
    }).exec();

    if(!existingProfile)  throw new ErrorResponse(400, 'Profile not found.', instagramErrorCodes.PROFILE_NOT_FOUND);
    existingProfile = JSON.parse(JSON.stringify(existingProfile));

    if(JSON.stringify(authenticatedUser._id) === JSON.stringify(existingProfile.profile.user_id)) {
        
        redis.set(`getUserProfileByUsername-${authenticatedUser._id}-${username}`, JSON.stringify({
            status: 'ok', 
            userProfile: existingProfile, 
            isOwned: true
        }), {
            EX: 300,
            NX: true
        });
        
        return res.status(200).json({
            status: 'ok', 
            userProfile: existingProfile, 
            isOwned: true
        });
    }else {
        let isAuthenticatedUserFollowThisProfile = await Follower.findOne({user_id: authenticatedUser._id, profile_id: existingProfile.profile._id});
        let authenticatedUserFollowingWhoFollowingThisProfile = [];
        let currentUser: any = await User.findOne({_id: authenticatedUser._id}).select('following').populate({
            select: 'profile_id',
            path: 'following',
            populate: {
                select: 'user_id', 
                path: 'profile_id',
                populate: {
                    select: 'username following profile',
                    path: 'user_id',
                    populate: [
                        {
                            path: 'following',
                            populate: {
                                path: 'profile_id'
                            }
                        },
                        {
                            path: 'profile'
                        }
                    ]
                }
            }
        });

        for(let i = 0; i < currentUser.following.length; i++) {
            for(let j = 0; j < currentUser.following[i].profile_id.user_id.following.length; j++) {
                if(JSON.stringify(currentUser.following[i].profile_id.user_id.following[j].profile_id._id) === JSON.stringify(existingProfile.profile._id)) {
                    let newAuthenticatedUserFollowingWhoFollowingThisProfile = currentUser.following[i].profile_id.user_id;
                    newAuthenticatedUserFollowingWhoFollowingThisProfile.following = [];
                    authenticatedUserFollowingWhoFollowingThisProfile.push(newAuthenticatedUserFollowingWhoFollowingThisProfile);
                    j = currentUser.following[i].profile_id.user_id.following.length;
                }
            }
        }

        redis.set(`getUserProfileByUsername-${authenticatedUser._id}-${username}`, JSON.stringify({
            status: 'ok', 
            userProfile: existingProfile, 
            isOwned: false,
            isAuthenticatedUserFollowThisProfile: isAuthenticatedUserFollowThisProfile ? true : false,
            authenticatedUserFollowingWhoFollowingThisProfile: authenticatedUserFollowingWhoFollowingThisProfile
        }), {
            EX: 300,
            NX: true
        });

        return res.status(200).json({
            status: 'ok', 
            userProfile: existingProfile, 
            isOwned: false,
            isAuthenticatedUserFollowThisProfile: isAuthenticatedUserFollowThisProfile ? true : false,
            authenticatedUserFollowingWhoFollowingThisProfile: authenticatedUserFollowingWhoFollowingThisProfile
        });
    }
});

const getUserPostsProfileByUsername = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { username } = mongoSanitize.sanitize(req.params);

    if(!username) throw new ErrorResponse(400, 'Username is required.', instagramErrorCodes.NO_USERNAME_FOR_GET_PROFILE);

    username = xss(username);

    const { error } = validations.getUserProfileValidate(username);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_GET_USER_PROFILE_VALIDATION);

    // Find the user by their username
    const user = await User.findOne({ username });

    if (!user) throw new ErrorResponse(404, 'User not found.', instagramErrorCodes.INVALID_GET_USER_PROFILE_VALIDATION);

    const allPosts = await Post.find({ user_id: user._id })
        .select('post likes comments viewers profile_id user_id caption alt_text createdAt')
        .sort({ createdAt: -1 })
        .populate([
            {
            select: '_id profilePicture',
            path: 'profile_id',
            },
            {
            select: '_id username',
            path: 'user_id',
            },
            {
            select: '_id profile',
            path: 'likes',
            populate: {
                select: '_id',
                path: 'profile',
            },
            },
            {
            select: 'user_id',
            path: 'comments',
            },
        ]).limit(7);

    const currentUser: any = await User.findOne({_id: authenticatedUser._id}).select('likePost savePost').populate([
        {
            select: 'post_id',
            path: 'likePost'
        },
        {
            select: 'post_id',
            path: 'savePost'
        }
    ]);   

    let allPostsToBeSent = [];
    let allPostsToBeSentLimit6 = [];

    for(let i = 0; i < allPosts.length; i++) {
        if(allPostsToBeSentLimit6.length === 6) {
            i = allPosts.length;
        }else {
            allPostsToBeSentLimit6.push(allPosts[i]);
        }
    }

    for(let i = 0; i < allPostsToBeSentLimit6.length; i++) {
        let userPost = JSON.parse(JSON.stringify(allPostsToBeSentLimit6[i]));

        let isAuthenticatedUserLikeThisPost: boolean = false;
        let isAuthenticatedUserSaveThisPost: boolean = false;
    
        for(let i = 0; i < currentUser.likePost.length; i++) {
            if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.likePost[i].post_id)) {
                isAuthenticatedUserLikeThisPost = true;
                i = currentUser.likePost.length;
            }
        }   

        for(let i = 0; i < currentUser.savePost.length; i++) {
            if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.savePost[i].post_id)) {
                isAuthenticatedUserSaveThisPost = true;
                i = currentUser.likePost.length;
            }
        }   
    
        if(isAuthenticatedUserLikeThisPost) {
            userPost.isAuthenticatedUserLikeThisPost = true;
        }else {
            userPost.isAuthenticatedUserLikeThisPost = false;
        }

        if(isAuthenticatedUserSaveThisPost) {
            userPost.isAuthenticatedUserSaveThisPost = true;
        }else {
            userPost.isAuthenticatedUserSaveThisPost = false;
        }

        allPostsToBeSent.push(userPost);
    }

    redis.set(`getUserPostsProfileByUsername-${username}`, JSON.stringify({
        status: 'ok', 
        allPosts: allPostsToBeSent, 
        length: (allPosts.length - allPostsToBeSent.length)
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', allPosts: allPostsToBeSent, length: (allPosts.length - allPostsToBeSent.length)});
});

const getMoreUserPostsProfileByUsername = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { allPostsId } = mongoSanitize.sanitize(req.body);
    let { username } = mongoSanitize.sanitize(req.params);

    if(!username) throw new ErrorResponse(400, 'Username is required.', instagramErrorCodes.NO_USERNAME_FOR_GET_PROFILE);

    username = xss(username);

    const { error } = validations.getUserProfileValidate(username);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_GET_USER_PROFILE_VALIDATION);

    // Find the user by their username
    const user = await User.findOne({ username });

    if (!user) throw new ErrorResponse(404, 'User not found.', instagramErrorCodes.INVALID_GET_USER_PROFILE_VALIDATION);

    const allPosts = await Post.find({ user_id: user._id, _id: { $nin: allPostsId } })
        .select('post likes comments viewers profile_id user_id caption alt_text createdAt')
        .sort({ createdAt: -1 })
        .populate([
            {
            select: '_id profilePicture',
            path: 'profile_id',
            },
            {
            select: '_id username',
            path: 'user_id',
            },
            {
            select: '_id profile',
            path: 'likes',
            populate: {
                select: '_id',
                path: 'profile',
            },
            },
            {
            select: 'user_id',
            path: 'comments',
            },
        ]).limit(7);

    const currentUser: any = await User.findOne({_id: authenticatedUser._id}).select('likePost savePost').populate([
        {
            select: 'post_id',
            path: 'likePost'
        },
        {
            select: 'post_id',
            path: 'savePost'
        }
    ]);   

    let allPostsToBeSent = [];
    let allPostsToBeSentLimit6 = [];

    for(let i = 0; i < allPosts.length; i++) {
        if(allPostsToBeSentLimit6.length === 6) {
            i = allPosts.length;
        }else {
            allPostsToBeSentLimit6.push(allPosts[i]);
        }
    }

    for(let i = 0; i < allPostsToBeSentLimit6.length; i++) {
        let userPost = JSON.parse(JSON.stringify(allPostsToBeSentLimit6[i]));

        let isAuthenticatedUserLikeThisPost: boolean = false;
        let isAuthenticatedUserSaveThisPost: boolean = false;
    
        for(let i = 0; i < currentUser.likePost.length; i++) {
            if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.likePost[i].post_id)) {
                isAuthenticatedUserLikeThisPost = true;
                i = currentUser.likePost.length;
            }
        }   

        for(let i = 0; i < currentUser.savePost.length; i++) {
            if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.savePost[i].post_id)) {
                isAuthenticatedUserSaveThisPost = true;
                i = currentUser.likePost.length;
            }
        }   
    
        if(isAuthenticatedUserLikeThisPost) {
            userPost.isAuthenticatedUserLikeThisPost = true;
        }else {
            userPost.isAuthenticatedUserLikeThisPost = false;
        }

        if(isAuthenticatedUserSaveThisPost) {
            userPost.isAuthenticatedUserSaveThisPost = true;
        }else {
            userPost.isAuthenticatedUserSaveThisPost = false;
        }

        allPostsToBeSent.push(userPost);
    }

    return res.status(200).json({status: 'ok', allPosts: allPostsToBeSent, length: (allPosts.length - allPostsToBeSent.length)});
});

const getAllPosts = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { allPostsId } = mongoSanitize.sanitize(req.body);

    let currentUser = await User.findOne({_id: authenticatedUser._id}).select('following').populate({
        select: 'profile_id',
        path: 'following'
    });

    if(currentUser === null) throw new ErrorResponse(404, '', 404);

    const followingProfileIds = currentUser.following.map((followingUser: any) => followingUser.profile_id);

    let allNotYetViewedPosts: any = await Post.find({_id: { $nin: allPostsId }, profile_id: { $in: followingProfileIds }, viewers: { $nin: [authenticatedUser._id] }})
        .select('post likes comments viewers profile_id user_id caption alt_text createdAt')
        .populate([
            {
                select: '_id profilePicture',
                path: 'profile_id'
            },
            {
                select: '_id username',
                path: 'user_id'
            },
            {
                select: '_id profile',
                path: 'likes',
                populate: {
                    select: '_id',
                    path: 'profile'
                }
            },
            {
                select: 'user_id',
                path: 'comments'
            }
        ]).limit(5);


    if(allNotYetViewedPosts.length > 0) {
        // IF SOMEONE OF THE AUTHENTICATED USER FOLLOWING UPLOAD A POST AND THE AUTHENTICATED USER DID NOT YET SEE IT. WE WILL SHOW THAT POST.

        let newAllNotYetViewedPosts: any = [];

        for(let i = 0; i < allNotYetViewedPosts.length; i++) {
            let currentPost = JSON.parse(JSON.stringify(allNotYetViewedPosts[i]));
            currentPost = authenticatedUserFollowingWhoLikePost(currentPost, followingProfileIds);
            currentPost = isAuthenticatedUserLikeThisPost(currentPost, authenticatedUser._id);
            currentPost = getAllCommentsAuthenticatedUserToThePost(currentPost, authenticatedUser._id);

            if(newAllNotYetViewedPosts.length == 4) {
                return res.status(200).json({status: 'ok', allPosts: newAllNotYetViewedPosts, length: (allNotYetViewedPosts.length - 4)}); 
            }else {
                newAllNotYetViewedPosts.push(currentPost);
                await Post.findOneAndUpdate({_id: currentPost._id}, {$push: { viewers: authenticatedUser._id }});
            }
        }

        return res.status(200).json({status: 'ok', allPosts: newAllNotYetViewedPosts, length: (allNotYetViewedPosts.length - allNotYetViewedPosts.length)}); 
    }else {
        let allViewedPosts: any = await Post.find({_id: { $nin: allPostsId }, profile_id: { $in: followingProfileIds }, viewers: { $in: [authenticatedUser._id] }})
        .select('post likes viewers profile_id user_id caption alt_text createdAt')
        .populate([
            {
                select: '_id profilePicture',
                path: 'profile_id'
            },
            {
                select: '_id username',
                path: 'user_id'
            },
            {
                select: '_id profile',
                path: 'likes',
                populate: {
                    select: '_id',
                    path: 'profile'
                }
            },
            {
                select: 'user_id',
                path: 'comments'
            }
        ]).limit(5);

        let newAllViewedPosts = [];

        for(let i = 0; i < allViewedPosts.length; i++) {
            let currentPost = JSON.parse(JSON.stringify(allViewedPosts[i]));
            currentPost = authenticatedUserFollowingWhoLikePost(currentPost, followingProfileIds);
            currentPost = isAuthenticatedUserLikeThisPost(currentPost, authenticatedUser._id);
            currentPost = getAllCommentsAuthenticatedUserToThePost(currentPost, authenticatedUser._id);

            if(newAllViewedPosts.length == 4) {
                return res.status(200).json({status: 'ok', allPosts: newAllViewedPosts, length: (allViewedPosts.length - 4)}); 
            }else {
                newAllViewedPosts.push(currentPost);
            }
        }

        return res.status(200).json({status: 'ok', allPosts: newAllViewedPosts, length: (allViewedPosts.length - allViewedPosts.length)}); 
    }
});

const createNewPost = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let uploadedFiles: any = req.files;

    let { caption, alt_text } = mongoSanitize.sanitize(req.body);
    if(uploadedFiles.length === 0) throw new ErrorResponse(400, "Please upload atleast one photo or video.", instagramErrorCodes.INCOMPLETE_POST_FORM);

    caption = xss(caption);
    alt_text = xss(alt_text);

    const { error } = validations.createNewPostValidate(caption, alt_text);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_USER_INPUT_CREATE_POST);

    let post = [];
    for(let key in uploadedFiles) {
        let newPost: any = {};

        if(Array.isArray(uploadedFiles[key])) {
            // THIS MEANS THERE IS VIDEO POSTER UPLOADED
            let uploaded: any = await cloudinaryFunctions.uploadFileToCloudinary(uploadedFiles[key][0]);
            newPost.post = uploaded.secure_url;
            newPost.type = JSON.parse(JSON.stringify(uploadedFiles[key][0])).mimetype;
            if(uploadedFiles[key][1]) {
                let posterUploaded: any = await cloudinaryFunctions.uploadFileToCloudinary(uploadedFiles[key][1], true); // WE ADD TRUE BECAUSE THIS FILE AND ALSO IMAGE IS A VIDEO POSTER
                newPost.poster = posterUploaded.secure_url;
            }
            post.push(newPost);
        }else {
            // THIS MEANS THERE IS NO VIDEO POSTER UPLOADED
            let uploaded : any = await cloudinaryFunctions.uploadFileToCloudinary(uploadedFiles[key]);
            newPost.post = uploaded.secure_url;
            newPost.type = JSON.parse(JSON.stringify(uploadedFiles[key])).mimetype;
            post.push(newPost);
        }
    }
    
    const savedPost = await Post.create({
        post: post, 
        caption: caption, 
        alt_text: alt_text, 
        profile_id: authenticatedUser.profile._id, 
        user_id: authenticatedUser._id
    });

    await Profile.findOneAndUpdate({_id: authenticatedUser.profile._id}, { $push: { posts: savedPost } });

    const currentUser = await User.findOne({_id: authenticatedUser._id}).select('-_id username');   
    if(!currentUser) if(!currentUser) throw new ErrorResponse(400, "User not found.", instagramErrorCodes.USER_NOT_FOUND_UPDATE_PROFILE_PICTURE);

    redis.del(`getUserPostsProfileByUsername-${currentUser.username}`);
    redis.del(`getUserProfileByUsername-${authenticatedUser._id}-${currentUser.username}`);

    return res.status(200).json({status: 'ok'});
}); 

const getUserPost = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    
    let { post_id } = mongoSanitize.sanitize(req.params);
    if(!post_id) throw new ErrorResponse(400, 'Post id is required.', instagramErrorCodes.NO_POST_ID_FOR_GET_POST);

    post_id = xss(post_id);

    const { error } = validations.getUserPostValidate(post_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_GET_USER_POST_VALIDATION);
        
    const existingPost = await Post.findOne({_id: post_id}).select('post caption likes alt_text profile_id user_id createdAt updatedAt')
        .populate([
            {
                select: 'profilePicture posts',
                path: 'profile_id',
                populate: {
                    select: 'post comments likes',
                    path: 'posts',
                    options: {
                        limit: 6,
                        match: { _id: {$ne: post_id}},
                        sort: {createdAt: -1}
                    }
                }
            }
        ]).populate({
            select: 'username',
            path: 'user_id'
        });

    if(!existingPost) {
        throw new ErrorResponse(400, 'Post not found.', instagramErrorCodes.POST_NOT_FOUND);
    }

    const currentUser: any = await User.findOne({_id: authenticatedUser._id}).select('likePost').populate({
        select: 'post_id',
        path: 'likePost'
    });   

    if(!currentUser) throw new ErrorResponse(400, 'User is not found', instagramErrorCodes.NO_AUTHENTICATED_USER);

    let userPost = JSON.parse(JSON.stringify(existingPost));
    let isAuthenticatedUserLikeThisPost: boolean = false;

    for(let i = 0; i < currentUser.likePost.length; i++) {
        if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.likePost[i].post_id)) {
            isAuthenticatedUserLikeThisPost = true;
            i = currentUser.likePost.length;
        }
    }   

    if(isAuthenticatedUserLikeThisPost) {
        userPost.isAuthenticatedUserLikeThisPost = true;
    }else {
        userPost.isAuthenticatedUserLikeThisPost = false;
    }

    redis.set(`getUserPost-${post_id}`, JSON.stringify({
        status: 'ok', 
        userPost: userPost
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', userPost: userPost});
});

const followProfile = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { profile_id } = mongoSanitize.sanitize(req.body);

    if(!profile_id) throw new ErrorResponse(400, "Profile id is required.", instagramErrorCodes.NO_PROFILE_ID_FOLLOW_PROFILE);
    
    profile_id = xss(profile_id);
    
    const { error } = validations.followProfileValidate(profile_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_PROFILE_ID_VALIDATION_FOLLOW_PROFILE);

    let newFollowing = await Following.create({
        user_id: authenticatedUser._id,
        profile_id: profile_id
    });

    let newFollower = await Follower.create({
        user_id: authenticatedUser._id,
        profile_id: profile_id
    });

    await User.findOneAndUpdate({_id: authenticatedUser._id}, { $push: { following: newFollowing } });
    await Profile.findOneAndUpdate({_id: profile_id}, { $push: { followers: newFollower } });
    
    let currentUser = await User.findOne({_id: authenticatedUser._id}).select('-_id username');
    if(!currentUser) throw new ErrorResponse(400, "User not found.", instagramErrorCodes.USER_NOT_FOUND_UPDATE_PROFILE_PICTURE);

    let currentUserProfile = await User.findOne({profile: profile_id}).select('-_id username');
    if(!currentUserProfile) throw new ErrorResponse(400, "User not found.", instagramErrorCodes.USER_NOT_FOUND_UPDATE_PROFILE_PICTURE);

    redis.del(`getUserProfileByUsername-${authenticatedUser._id}-${currentUser.username}`);
    redis.del(`getUserProfileByUsername-${authenticatedUser._id}-${currentUserProfile.username}`);
    redis.del(`suggestFollowProfiles-${authenticatedUser._id}`);
    redis.del(`getFollowing-${currentUser.username}`);
    redis.del(`getFollowers-${profile_id}`);

    return res.status(200).json({status: 'ok'});
});

const unfollowProfile = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { profile_id } = mongoSanitize.sanitize(req.body);

    if(!profile_id) throw new ErrorResponse(400, "Profile id is required.", instagramErrorCodes.NO_PROFILE_ID_UNFOLLOW_PROFILE);

    profile_id = xss(profile_id);

    const { error } = validations.unfollowProfileValidate(profile_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_PROFILE_ID_VALIDATION_UNFOLLOW_PROFILE);

    let unFollow = await Following.findOneAndDelete({user_id: authenticatedUser._id, profile_id: profile_id});
    let unFollower = await Follower.findOneAndDelete({user_id: authenticatedUser._id, profile_id: profile_id});
    
    if(!unFollow) {
        throw new ErrorResponse(400, 'Following not found.', instagramErrorCodes.FOLLOWING_NOT_FOUND);
    }

    if(!unFollower) {
        throw new ErrorResponse(400, 'Follower not found.', instagramErrorCodes.FOLLOWER_NOT_FOUND);
    }

    await User.findOneAndUpdate({_id: authenticatedUser._id}, { $pull: { following: unFollow._id } });
    await Profile.findOneAndUpdate({_id: profile_id}, { $pull: { followers: unFollower._id } });
    
    let currentUser = await User.findOne({_id: authenticatedUser._id}).select('-_id username');
    if(!currentUser) throw new ErrorResponse(400, "User not found.", instagramErrorCodes.USER_NOT_FOUND_UPDATE_PROFILE_PICTURE);

    let currentUserProfile = await User.findOne({profile: profile_id}).select('-_id username');
    if(!currentUserProfile) throw new ErrorResponse(400, "User not found.", instagramErrorCodes.USER_NOT_FOUND_UPDATE_PROFILE_PICTURE);

    redis.del(`getUserProfileByUsername-${authenticatedUser._id}-${currentUser.username}`);
    redis.del(`getUserProfileByUsername-${authenticatedUser._id}-${currentUserProfile.username}`);
    redis.del(`suggestFollowProfiles-${authenticatedUser._id}`);
    redis.del(`getFollowing-${currentUser.username}`);
    redis.del(`getFollowers-${profile_id}`);

    return res.status(200).json({status: 'ok'});
});

const likePost = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { post_id } = mongoSanitize.sanitize(req.body);

    if(!post_id) throw new ErrorResponse(400, "Post id is required.", instagramErrorCodes.NO_POST_ID_LIKE_POST);
    
    post_id = xss(post_id);

    const { error } = validations.likePostValidate(post_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_POST_ID_VALIDATION_LIKE_POST);

    let newLike = await LikePost.create({
        'post_id': post_id,
        'user_id': authenticatedUser._id
    });

    await Post.findOneAndUpdate({_id: post_id}, {$push: {likes: authenticatedUser._id}});
    await User.findOneAndUpdate({_id: authenticatedUser._id}, {$push: {likePost: newLike}});

    let currentPost = await Post.findOne({_id: post_id}).select('user_id').populate({
        select: 'username',
        path: 'user_id'
    });
    if(!currentPost) throw new ErrorResponse(404, '', 404);

    let currentUser = await User.findOne({username: currentPost.user_id.username}).select('-_id username');
    if(currentUser === null) throw new ErrorResponse(404, '', 404);

    redis.del(`getUserPost-${post_id}`);
    redis.del(`getAllUsersWhoLikePost-${post_id}`);
    redis.del(`getUserPostsProfileByUsername-${currentUser.username}`);

    return res.status(200).json({status: 'ok'});
});

const unlikePost = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { post_id } = mongoSanitize.sanitize(req.body);

    if(!post_id) throw new ErrorResponse(400, "Post id is required.", instagramErrorCodes.NO_POST_ID_UNLIKE_POST);

    post_id = xss(post_id);

    const { error } = validations.unlikePostValidate(post_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_POST_ID_VALIDATION_UNLIKE_POST);

    let newUnlike = await LikePost.findOneAndDelete({post_id: post_id, user_id: authenticatedUser._id});

    if(!newUnlike) {
        throw new ErrorResponse(400, 'Like post not found.', instagramErrorCodes.LIKE_POST_NOT_FOUND);
    }

    await Post.findOneAndUpdate({_id: post_id}, {$pull: {likes: authenticatedUser._id}});
    await User.findOneAndUpdate({_id: authenticatedUser._id}, {$pull: {likePost: newUnlike._id}});

    let currentPost = await Post.findOne({_id: post_id}).select('user_id').populate({
        select: 'username',
        path: 'user_id'
    });
    if(!currentPost) throw new ErrorResponse(404, '', 404);

    let currentUser = await User.findOne({username: currentPost.user_id.username}).select('-_id username');
    if(currentUser === null) throw new ErrorResponse(404, '', 404);

    redis.del(`getUserPost-${post_id}`);
    redis.del(`getAllUsersWhoLikePost-${post_id}`);
    redis.del(`getUserPostsProfileByUsername-${currentUser.username}`);

    return res.status(200).json({status: 'ok'});
});

const postComment = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;

    let { post_id, comment } = mongoSanitize.sanitize(req.body);
    if(!post_id || !comment) throw new ErrorResponse(400, "Post id and comment is required.", instagramErrorCodes.NO_POST_ID_OR_COMMENT);
    
    post_id = xss(post_id);
    comment = xss(comment);

    const { error } = validations.postCommentValidate(post_id, comment);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_USER_INPUT_POST_COMMENT);

    let newComment = await PostComment.create({
        post_id: post_id,
        comment: comment,
        user_id: authenticatedUser._id
    });

    await Post.findOneAndUpdate({_id: post_id}, {$push: {comments: newComment}});
    await User.findOneAndUpdate({_id: authenticatedUser._id}, {$push: {postComment: newComment}});

    return res.status(200).json({status: 'ok'});
});

const deletePostComment = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;

    let { post_id, comment_id } = mongoSanitize.sanitize(req.body);
    if(!post_id || !comment_id) throw new ErrorResponse(400, "Post id and comment is is required.", instagramErrorCodes.NO_POST_ID_OR_COMMENT_ID);

    post_id = xss(post_id);
    comment_id = xss(comment_id);

    const { error } = validations.deletePostCommentValidate(post_id, comment_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_POST_COMMENT_VALIDATION);

    let removedComment = await PostComment.findOneAndDelete({_id: comment_id, user_id: authenticatedUser._id});

    if(!removedComment) {
        throw new ErrorResponse(400, 'Post comment not found.', instagramErrorCodes.POST_COMMENT_NOT_FOUND);
    }

    await Post.findOneAndUpdate({_id: post_id}, {$pull: {comments: removedComment._id}});
    await User.findOneAndUpdate({_id: authenticatedUser._id}, {$pull: {postComment: removedComment._id}});

    return res.status(200).json({status: 'ok'});
});

const searchUsersByUsername = tryCatch(async (req: express.Request, res: express.Response) => {
    let { username } = mongoSanitize.sanitize(req.params);

    if(!username) throw new ErrorResponse(400, "Username is required.", instagramErrorCodes.NO_USERNAME_FOR_SEARCH_USERS);
    
    username = xss(username);
    
    const { error } = validations.searchUsersByUsernameValidate(username);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_USERNAME_FOR_SEARCH_USERS_VALIDATION);

    const users = await User.find({username: {$regex: username, $options: 'i'}}).select('-_id username profile').populate({
        select: '-_id profilePicture fullName',
        path: 'profile'
    }).limit(10);

    return res.status(200).json({status: 'ok', users: users});
});

const getFollowing = tryCatch(async (req: express.Request, res: express.Response) => {
    let { username } = mongoSanitize.sanitize(req.params);

    if(!username) throw new ErrorResponse(400, "Username is required.", instagramErrorCodes.NO_USERNAME_FOR_GET_FOLLOWING);
    
    username = xss(username);
    
    const { error } = validations.getFollowingByUsernameValidate(username);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_USERNAME_FOR_GET_FOLLOWING_VALIDATION);

    let following: any = await User.findOne({username: username}).select('-_id following').populate({
        select: '-_id profile_id',
        path: 'following',
        populate: {
            select: 'profilePicture fullName user_id',
            path: 'profile_id',
            populate: {
                select: '-_id username',
                path: 'user_id'
            }
        }
    });

    if(!following) throw new ErrorResponse(400, 'Username is not found.', instagramErrorCodes.USERNAME_NOT_FOUND_GET_FOLLOWING);

    following = JSON.parse(JSON.stringify(following));
    delete following?.username;

    redis.set(`getFollowing-${username}`, JSON.stringify({
        status: 'ok', 
        following: following
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', following: following});
});

const getFollowers = tryCatch(async (req: express.Request, res: express.Response) => {
    let { profile_id } = mongoSanitize.sanitize(req.params);

    if(!profile_id) throw new ErrorResponse(400, "Profile id is required.", instagramErrorCodes.NO_PROFILE_ID_FOR_GET_FOLLOWERS);
    
    profile_id = xss(profile_id);
    
    const { error } = validations.getFollowersByProfileIdValidate(profile_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_PROFILE_ID_FOR_GET_FOLLOWERS_VALIDATION);

    let followers: any = await Profile.findOne({_id: profile_id}).select('-_id followers').populate({
        select: '-_id user_id',
        path: 'followers',
        populate: {
            select: 'username profile',
            path: 'user_id',
            populate: {
                select: '-_id profilePicture fullName',
                path: 'profile'
            }
        }
    });

    if(!followers) throw new ErrorResponse(400, 'Profile is not found.', instagramErrorCodes.PROFILE_NOT_FOUND_FOR_GET_FOLLOWERS);

    redis.set(`getFollowers-${profile_id}`, JSON.stringify({
        status: 'ok', 
        followers: followers
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', followers: followers});
});

const removeFollower = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { user_id } = mongoSanitize.sanitize(req.body);

    if(!user_id) throw new ErrorResponse(400, "User id is required.", instagramErrorCodes.NO_USER_ID_GIVEN_FOR_REMOVE_FOLLOWER);

    user_id = xss(user_id);

    const { error } = validations.removeFollowerValidate(user_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_USER_ID_FOR_REMOVE_FOLLOWER_VALIDATION);

    let unFollow = await Following.findOneAndDelete({user_id: user_id, profile_id: authenticatedUser.profile._id});
    let unFollower = await Follower.findOneAndDelete({user_id: user_id, profile_id: authenticatedUser.profile._id});
    
    if(!unFollow) {
        throw new ErrorResponse(400, 'Following not found.', instagramErrorCodes.FOLLOWING_NOT_FOUND_FOR_REMOVE_FOLLOWER);
    }

    if(!unFollower) {
        throw new ErrorResponse(400, 'Follower not found.', instagramErrorCodes.FOLLOWER_NOT_FOUND_FOR_REMOVE_FOLLOWER);
    }

    await User.findOneAndUpdate({_id: user_id}, { $pull: { following: unFollow._id } });
    await Profile.findOneAndUpdate({_id: authenticatedUser.profile._id}, { $pull: { followers: unFollower._id } });

    return res.status(200).json({status: 'ok'});
});

const updateProfilePicture = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let newProfilePicture = req.files;
    if(!newProfilePicture) throw new ErrorResponse(400, "Profile picture is required.", instagramErrorCodes.NO_UPLOADED_PROFILE_PICTURE_FOR_UPDATE_PROFILE_PICTURE);

    let currentUser = await User.findOne({_id: authenticatedUser._id}).select('profile').populate({
        select: 'profilePicture',
        path: 'profile'
    });

    if(!currentUser) throw new ErrorResponse(400, "User not found.", instagramErrorCodes.USER_NOT_FOUND_UPDATE_PROFILE_PICTURE);

    if(currentUser.profile.profilePicture !== userSettings.DEFAULT_PROFILE_PICTURE) {
        let result: boolean = await cloudinaryFunctions.deleteOldProfilePicture(currentUser.profile.profilePicture);
        if(!result) throw new ErrorResponse(400, "Error in deleting old profile picture.", instagramErrorCodes.ERROR_DELETING_OLD_PROFILE_PICTURE_FOR_UPDATE_PROFILE_PICTURE);
        
        let uploadedNewProfilePicture: any = await cloudinaryFunctions.uploadFileToCloudinary(newProfilePicture['newProfilePicture'], false, true); 
        await Profile.findOneAndUpdate({user_id: authenticatedUser.id}, {profilePicture: uploadedNewProfilePicture.secure_url})
        return res.status(200).json({status: 'ok'});
    }

    let uploadedNewProfilePicture: any = await cloudinaryFunctions.uploadFileToCloudinary(newProfilePicture['newProfilePicture'], false, true); 
    await Profile.findOneAndUpdate({user_id: authenticatedUser.id}, {profilePicture: uploadedNewProfilePicture.secure_url})
    
    redis.del(`getUserProfileByUsername-${authenticatedUser._id}-${currentUser.username}`);
    
    return res.status(200).json({status: 'ok'});
});

const updateProfile = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { fullName, username, link, bio } = mongoSanitize.sanitize(req.body);

    if(!fullName || !username) throw new ErrorResponse(400, "Full name and username is required to update the profile.", instagramErrorCodes.INCOMPLETE_UPDATE_PROFILE_FORM_UPDATE_PROFILE);

    fullName = xss(fullName);
    username = xss(username);
    link = xss(link);
    bio = xss(bio);

    const { error } = validations.updateProfileValidate(fullName, username, link, bio);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_UPDATE_PROFILE_VALIDATION);

    await Profile.findOneAndUpdate({user_id: authenticatedUser.id}, {
        fullName: fullName,
        link: link,
        bio: bio
    });

    await User.findOneAndUpdate({_id: authenticatedUser._id}, {username: username});
    
    redis.del(`getUserProfileByUsername-${authenticatedUser._id}-${username}`);

    return res.status(200).json({status: 'ok'});
});

const updatePassword = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    
    let { oldPassword, newPassword, repeatNewPassword } = mongoSanitize.sanitize(req.body);

    if(!oldPassword || !newPassword || !repeatNewPassword) throw new ErrorResponse(400, "Old password, new password, and repeat new password is required to update the profile.", instagramErrorCodes.INCOMPLETE_UPDATE_PASSWORD_FORM_UPDATE_PASSWORD);

    oldPassword = xss(oldPassword);
    newPassword = xss(newPassword);
    repeatNewPassword = xss(repeatNewPassword);

    const { error } = validations.updatePasswordValidate(oldPassword, newPassword, repeatNewPassword);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_UPDATE_PASSWORD_VALIDATION);

    const existingUser = await User.findOne({_id: authenticatedUser.id}).select('password');

    if(!existingUser) throw new ErrorResponse(400, "User not found", instagramErrorCodes.USER_NOT_FOUND_UPDATE_PASSWORD);

    const isMatched = await existingUser.matchPasswords(oldPassword);
    if (!isMatched) throw new ErrorResponse(401, 'Invalid password.', instagramErrorCodes.PASSWORD_NOT_MATCH_UPDATE_PASSWORD);

    const hashedPassword = await argon2.hash(newPassword);
    await User.findOneAndUpdate({_id: authenticatedUser._id }, { password: hashedPassword });

    return res.status(200).json({status: 'ok'});
});

const explore = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser = lodash.get(req, 'authenticatedUser') as unknown as any;

    let allPosts = await Post.find({user_id: {$ne: authenticatedUser._id}})
        .sort({ likes: -1 })
        .select('post caption alt_text profile_id user_id likes comments createdAt')
        .populate([
            {
                select: 'profilePicture',
                path: 'profile_id'
            },
            {
                select: '_id username',
                path: 'user_id',
            },
            {
                select: 'user_id',
                path: 'likes'
            }
        ]).limit(11);

    const currentUser: any = await User.findOne({_id: authenticatedUser._id}).select('likePost').populate({
        select: 'post_id',
        path: 'likePost'
    }); 

    if(!currentUser) {
        throw new ErrorResponse(400, 'User is not found', instagramErrorCodes.NO_AUTHENTICATED_USER);
    }

    let allPostsLimit10 = [];

    for(let i = 0; i < allPosts.length; i++) {
        if(allPostsLimit10.length === 10) {
            i = allPosts.length;
        }else {
            allPostsLimit10.push(allPosts[i]);
        }
    }

    let newAllPosts = [];
    let nestedAllPosts: any = [];
    let eachNestedPost: any = [];

    for(let i = 0; i < allPostsLimit10.length; i++) {
        let userPost = JSON.parse(JSON.stringify(allPostsLimit10[i]));
        let isAuthenticatedUserLikeThisPost: boolean = false;
    
        for(let i = 0; i < currentUser.likePost.length; i++) {
            if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.likePost[i].post_id)) {
                isAuthenticatedUserLikeThisPost = true;
                i = currentUser.likePost.length;
            }
        }   
    
        if(isAuthenticatedUserLikeThisPost) {
            userPost.isAuthenticatedUserLikeThisPost = true;
        }else {
            userPost.isAuthenticatedUserLikeThisPost = false;
        }

        if(eachNestedPost.length === 5) {
            nestedAllPosts.push(eachNestedPost);
            eachNestedPost = [];
        }

        if(JSON.stringify(userPost.user_id._id) !== JSON.stringify(authenticatedUser._id)) {
            eachNestedPost.push(userPost);
        }

        newAllPosts.push(userPost);
    }

    if(eachNestedPost.length > 0) {
        nestedAllPosts.push(eachNestedPost);
    }

    redis.set(`explore-${authenticatedUser._id}`, JSON.stringify({
        status: 'ok', 
        nestedAllPosts: 
        nestedAllPosts, 
        allPosts: 
        newAllPosts, 
        length: (allPosts.length - allPostsLimit10.length)
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', nestedAllPosts: nestedAllPosts, allPosts: newAllPosts, length: (allPosts.length - allPostsLimit10.length)});
});

const moreExplore = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser = lodash.get(req, 'authenticatedUser') as unknown as any;
    let { allPostsId } = mongoSanitize.sanitize(req.body);

    let allPosts = await Post.find({_id: {$nin: allPostsId}, user_id: {$ne: authenticatedUser._id}})
        .sort({ likes: -1 })
        .select('post caption alt_text profile_id user_id likes comments createdAt')
        .populate([
            {
                select: 'profilePicture',
                path: 'profile_id'
            },
            {
                select: '_id username',
                path: 'user_id',
            },
            {
                select: 'user_id',
                path: 'likes'
            }
        ]).limit(11);

    const currentUser: any = await User.findOne({_id: authenticatedUser._id}).select('likePost').populate({
        select: 'post_id',
        path: 'likePost'
    }); 

    if(!currentUser) {
        throw new ErrorResponse(400, 'User is not found', instagramErrorCodes.NO_AUTHENTICATED_USER);
    }

    let allPostsLimit10 = [];

    for(let i = 0; i < allPosts.length; i++) {
        if(allPostsLimit10.length === 10) {
            i = allPosts.length;
        }else {
            allPostsLimit10.push(allPosts[i]);
        }
    }

    let newAllPosts = [];
    let nestedAllPosts: any = [];
    let eachNestedPost: any = [];

    for(let i = 0; i < allPostsLimit10.length; i++) {
        let userPost = JSON.parse(JSON.stringify(allPostsLimit10[i]));
        let isAuthenticatedUserLikeThisPost: boolean = false;
    
        for(let i = 0; i < currentUser.likePost.length; i++) {
            if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.likePost[i].post_id)) {
                isAuthenticatedUserLikeThisPost = true;
                i = currentUser.likePost.length;
            }
        }   
    
        if(isAuthenticatedUserLikeThisPost) {
            userPost.isAuthenticatedUserLikeThisPost = true;
        }else {
            userPost.isAuthenticatedUserLikeThisPost = false;
        }

        if(eachNestedPost.length === 5) {
            nestedAllPosts.push(eachNestedPost);
            eachNestedPost = [];
        }

        if(JSON.stringify(userPost.user_id._id) !== JSON.stringify(authenticatedUser._id)) {
            eachNestedPost.push(userPost);
        }

        newAllPosts.push(userPost);
    }

    if(eachNestedPost.length > 0) {
        nestedAllPosts.push(eachNestedPost);
    }

    return res.status(200).json({status: 'ok', nestedAllPosts: nestedAllPosts, allPosts: newAllPosts, length: (allPosts.length - allPostsLimit10.length)});
});

const getAllComments = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { specificPostId } = mongoSanitize.sanitize(req.params);

    let comments = await Post.findOne({_id: specificPostId}).select('comments').populate({
        select: 'comment likes user_id createdAt',
        path: 'comments',
        populate: [
            {
                select: '-_id username profile',
                path: 'user_id',
                populate: {
                    select: 'profilePicture',
                    path: 'profile'
                }
            },
            {
                select: 'user_id',
                path: 'likes'
            }
        ]
    });

    if(comments !== null) {
        let newComments = [];

        for(let i = 0; i < comments.comments.length; i++) {
            let isAuthenticatedUserLikeThisComment = false;
            let eachComment = JSON.parse(JSON.stringify(comments.comments[i]));

            for(let j = 0; j < eachComment.likes.length; j++) {
                if(JSON.stringify(eachComment.likes[j].user_id) === JSON.stringify(authenticatedUser._id)) {
                    isAuthenticatedUserLikeThisComment = true;
                    j = eachComment.likes.length;
                }
            }

            if(isAuthenticatedUserLikeThisComment) {
                eachComment.isAuthenticatedUserLikeThisComment = true;
            }else {
                eachComment.isAuthenticatedUserLikeThisComment = false;
            }

            newComments.push(eachComment);
        }

        redis.set(`getAllComments-${specificPostId}`, JSON.stringify({
            status: 'ok', 
            comments: {
                comments: newComments
            }
        }), {
            EX: 300,
            NX: true
        });

        return res.status(200).json({status: 'ok', comments: {comments: newComments}});
    }

    return res.status(200).json({status: 'ok', comments: comments});
});

const getAllPostsWithCaptionThatContainHashTag = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { hashtag } = mongoSanitize.sanitize(req.params);

    const allPosts = await Post.find({ caption: { $regex: `#${hashtag}`, $options: 'i' }})
    .sort({ likes: -1 })
    .select('post caption alt_text profile_id user_id likes comments createdAt')
    .populate([
        {
            select: 'profilePicture',
            path: 'profile_id'
        },
        {
            select: '_id username',
            path: 'user_id'
        },
        {
            select: 'user_id',
            path: 'likes'
        }
    ]).limit(7);

    const currentUser: any = await User.findOne({_id: authenticatedUser._id}).select('likePost').populate({
        select: 'post_id',
        path: 'likePost'
    });   

    let finalizedAllPosts = [];

    for(let i = 0; i < allPosts.length; i++) {
        let userPost = JSON.parse(JSON.stringify(allPosts[i]));
        let isAuthenticatedUserLikeThisPost: boolean = false;
    
        for(let i = 0; i < currentUser.likePost.length; i++) {
            if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.likePost[i].post_id)) {
                isAuthenticatedUserLikeThisPost = true;
                i = currentUser.likePost.length;
            }
        }   
    
        if(isAuthenticatedUserLikeThisPost) {
            userPost.isAuthenticatedUserLikeThisPost = true;
        }else {
            userPost.isAuthenticatedUserLikeThisPost = false;
        }

        if(finalizedAllPosts.length == 6) {
            redis.set(`getAllPostsWithCaptionThatContainHashTag-${hashtag}`, JSON.stringify({
                status: 'ok', 
                allPosts: finalizedAllPosts, 
                length: (allPosts.length - 6)
            }), {
                EX: 300,
                NX: true
            });

            return res.status(200).json({status: 'ok', allPosts: finalizedAllPosts, length: (allPosts.length - 6)});
        }else {
            finalizedAllPosts.push(userPost);
        }
    }

    redis.set(`getAllPostsWithCaptionThatContainHashTag-${hashtag}`, JSON.stringify({
        status: 'ok', 
        allPosts: finalizedAllPosts, 
        length: (allPosts.length - finalizedAllPosts.length)
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', allPosts: finalizedAllPosts, length: (allPosts.length - finalizedAllPosts.length)});
});

const getMoreAllPostsWithCaptionThatContainHashTag = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { hashtag, allPostsId } = mongoSanitize.sanitize(req.body);

    const allPosts = await Post.find({ caption: { $regex: `#${hashtag}`, $options: 'i' }, _id: { $nin: allPostsId }})
    .sort({ likes: -1 })
    .select('post caption alt_text profile_id user_id likes comments createdAt')
    .populate([
        {
            select: 'profilePicture',
            path: 'profile_id'
        },
        {
            select: '_id username',
            path: 'user_id'
        },
        {
            select: 'user_id',
            path: 'likes'
        }
    ]).limit(7);

    const currentUser: any = await User.findOne({_id: authenticatedUser._id}).select('likePost').populate({
        select: 'post_id',
        path: 'likePost'
    });   

    let finalizedAllPosts = [];

    for(let i = 0; i < allPosts.length; i++) {
        let userPost = JSON.parse(JSON.stringify(allPosts[i]));
        let isAuthenticatedUserLikeThisPost: boolean = false;
    
        for(let i = 0; i < currentUser.likePost.length; i++) {
            if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.likePost[i].post_id)) {
                isAuthenticatedUserLikeThisPost = true;
                i = currentUser.likePost.length;
            }
        }   
    
        if(isAuthenticatedUserLikeThisPost) {
            userPost.isAuthenticatedUserLikeThisPost = true;
        }else {
            userPost.isAuthenticatedUserLikeThisPost = false;
        }

        if(finalizedAllPosts.length == 6) {
            return res.status(200).json({status: 'ok', allPosts: finalizedAllPosts, length: (allPosts.length - 6)});
        }else {
            finalizedAllPosts.push(userPost);
        }
    }

    return res.status(200).json({status: 'ok', allPosts: finalizedAllPosts, length: (allPosts.length - finalizedAllPosts.length)});
});

const deletePost = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { post_id } = mongoSanitize.sanitize(req.body);

    if(!post_id) throw new ErrorResponse(400, "Post id is required.", instagramErrorCodes.NO_POST_ID_FOR_DELETE_POST);
    
    post_id = xss(post_id);

    const { error } = validations.deletePostValidate(post_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_POST_ID_VALIDATION_FOR_DELETE_POST);

    let deletedPost = await Post.findOneAndDelete({_id: post_id});

    if(!deletePost || (deletedPost === null) || (deletedPost._id === null)) throw new ErrorResponse(400, "Post not found.", instagramErrorCodes.POST_NOT_FOUND_FOR_DELETE_POST);

    await Profile.findOneAndUpdate({_id: authenticatedUser.profile._id}, { $pull: { posts: deletedPost._id } });

    const currentUser = await User.findOne({_id: authenticatedUser._id}).select('-_id username');   
    if(!currentUser) if(!currentUser) throw new ErrorResponse(400, "User not found.", instagramErrorCodes.USER_NOT_FOUND_UPDATE_PROFILE_PICTURE);

    redis.del(`getUserPostsProfileByUsername-${currentUser.username}`);
    redis.del(`getUserProfileByUsername-${authenticatedUser._id}-${currentUser.username}`);

    return res.status(200).json({status: 'ok'});
});

const updatePost = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let {post_id, caption, alt_text } = mongoSanitize.sanitize(req.body);

    if(!post_id) throw new ErrorResponse(400, "Post id is required.", instagramErrorCodes.NO_POST_ID_FOR_UPDATE_POST);

    post_id = xss(post_id);
    caption = xss(caption);
    alt_text = xss(alt_text);

    const { error } = validations.updatePostValidate(post_id, caption, alt_text);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_POST_ID_VALIDATION_FOR_DELETE_POST);

    let updatedPost = await Post.findOneAndUpdate({_id: post_id, user_id: authenticatedUser._id}, {
        caption: caption,
        alt_text: alt_text
    });

    if(!updatedPost) throw new ErrorResponse(400, "Post not found.", instagramErrorCodes.POST_NOT_FOUND_FOR_UPDATE_POST);
    
    const currentUser = await User.findOne({_id: authenticatedUser._id}).select('-_id username');   
    if(!currentUser) if(!currentUser) throw new ErrorResponse(400, "User not found.", instagramErrorCodes.USER_NOT_FOUND_UPDATE_PROFILE_PICTURE);

    redis.del(`getUserPostsProfileByUsername-${currentUser.username}`);
    redis.del(`getUserProfileByUsername-${authenticatedUser._id}-${currentUser.username}`);
    
    return res.status(200).json({status: 'ok'});
});

const likeComment = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { comment_id } = mongoSanitize.sanitize(req.body);

    if(!comment_id) throw new ErrorResponse(400, "Comment id is required.", instagramErrorCodes.NO_COMMENT_ID_FOR_LIKE_COMMENT);

    comment_id = xss(comment_id);

    const { error } = validations.likeCommentValidate(comment_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_COMMENT_ID_VALIDATION_FOR_LIKE_COMMENT);

    let newLikeComment = await LikeComment.create({
        comment_id: comment_id,
        user_id: authenticatedUser._id
    });

    await PostComment.findOneAndUpdate({_id: comment_id}, {$push: { likes: [newLikeComment]}});
    await User.findOneAndUpdate({_id: authenticatedUser._id}, {$push: { likeComment: [newLikeComment]}});

    redis.del(`getAllUsersWhoLikeSpecificComment-${comment_id}`);

    return res.status(200).json({status: 'ok'});
});

const unlikeComment = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { comment_id } = mongoSanitize.sanitize(req.body);

    if(!comment_id) throw new ErrorResponse(400, "Comment id is required.", instagramErrorCodes.NO_COMMENT_ID_FOR_UNLIKE_COMMENT);

    comment_id = xss(comment_id);

    const { error } = validations.unlikeCommentValidate(comment_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_COMMENT_ID_VALIDATION_FOR_UNLIKE_COMMENT);

    let unlikeComment = await LikeComment.findOneAndDelete({comment_id: comment_id, user_id: authenticatedUser._id});

    if(!unlikeComment) throw new ErrorResponse(400, 'Like comment not found.', instagramErrorCodes.LIKE_COMMENT_NOT_FOUND);

    await PostComment.findOneAndUpdate({_id: comment_id}, {$pull: {likes: unlikeComment._id}});
    await User.findOneAndUpdate({_id: authenticatedUser._id}, {$pull: {likeComment: unlikeComment._id}});

    redis.del(`getAllUsersWhoLikeSpecificComment-${comment_id}`);

    return res.status(200).json({status: 'ok'});
});

const getAllUsersWhoLikeSpecificComment = tryCatch(async (req: express.Request, res: express.Response) => {
    let { comment_id } = mongoSanitize.sanitize(req.params);
    if(!comment_id) throw new ErrorResponse(400, 'Comment id is required.', instagramErrorCodes.NO_COMMENT_ID_FOR_GET_USERS_WHO_LIKE_SPECIFIC_POST);

    comment_id = xss(comment_id);

    const { error } = validations.getAllUsersWhoLikeSpecificCommentValidate(comment_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_COMMENT_ID_FOR_GET_USERS_WHO_LIKE_SPECIFIC_POST_VALIDATION);

    let allUsers = await LikeComment.find({comment_id: comment_id}).select('-_id user_id').populate({
        select: '_id username profile',
        path: 'user_id',
        populate: {
            select: '-_id fullName profilePicture',
            path: 'profile'
        }
    });

    redis.set(`getAllUsersWhoLikeSpecificComment-${comment_id}`, JSON.stringify({
        status: 'ok', 
        allUsers: allUsers
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', allUsers: allUsers});
});

const getAllUsersWhoLikePost = tryCatch(async (req: express.Request, res: express.Response) => {
    let { post_id } = mongoSanitize.sanitize(req.params);
    if(!post_id) throw new ErrorResponse(400, 'Post id is required.', instagramErrorCodes.NO_POST_ID_FOR_GET_USERS_WHO_LIKE_POST);

    post_id = xss(post_id);

    const { error } = validations.getAllUsersWhoLikePostValidate(post_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_POST_ID_FOR_GET_USERS_WHO_LIKE_POST_VALIDATION);

    let allUsers = await LikePost.find({post_id: post_id}).select('-_id user_id').populate({
        select: '_id username profile',
        path: 'user_id',
        populate: {
            select: '-_id fullName profilePicture',
            path: 'profile'
        }
    });

    redis.set(`getAllUsersWhoLikePost-${post_id}`, JSON.stringify({
        status: 'ok', 
        allUsers: allUsers
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', allUsers: allUsers});
});

const savePost = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { post_id } = mongoSanitize.sanitize(req.body);

    if(!post_id) throw new ErrorResponse(400, 'Post id is required.', instagramErrorCodes.NO_POST_ID_FOR_SAVE_POST);

    post_id = xss(post_id);

    const { error } = validations.savePostValidate(post_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_POST_ID_FOR_SAVE_POST_VALIDATION);

    let savedPost = await SavePost.create({
        post_id: post_id,
        user_id: authenticatedUser._id
    });

    let currentUser = await User.findOneAndUpdate({_id: authenticatedUser._id}, {$push: {savePost: savedPost}})
    if(!currentUser) throw new ErrorResponse(400, 'User is not found', instagramErrorCodes.NO_AUTHENTICATED_USER);

    redis.del(`getUserPost-${post_id}`);
    redis.del(`getAllSavedPostsLimit4-${currentUser.username}`);
    redis.del(`getAllSavedPosts-${currentUser.username}`);

    return res.status(200).json({status: 'ok'});
});

const unsavePost = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let { post_id } = mongoSanitize.sanitize(req.body);

    if(!post_id) throw new ErrorResponse(400, 'Post id is required.', instagramErrorCodes.NO_POST_ID_FOR_UNSAVE_POST);

    post_id = xss(post_id);

    const { error } = validations.savePostValidate(post_id);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_POST_ID_FOR_UNSAVE_POST_VALIDATION);

    let unsavedPost = await SavePost.findOneAndDelete({post_id: post_id, user_id: authenticatedUser._id});
    if(!unsavedPost) throw new ErrorResponse(400, 'Saved post not found.', instagramErrorCodes.SAVED_POST_NOT_FOUND_FOR_UNSAVE_POST);

    let currentUser = await User.findOneAndUpdate({_id: authenticatedUser._id}, {$pull: {savePost: unsavedPost._id}});
    if(!currentUser) throw new ErrorResponse(400, 'User is not found', instagramErrorCodes.NO_AUTHENTICATED_USER);

    redis.del(`getUserPost-${post_id}`);
    redis.del(`getAllSavedPostsLimit4-${currentUser.username}`);
    redis.del(`getAllSavedPosts-${currentUser.username}`);

    return res.status(200).json({status: 'ok'});
});

const getAllSavedPostsLimit4 = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    
    let { username } = mongoSanitize.sanitize(req.params);
    if(!username) throw new ErrorResponse(400, 'Username is required.', instagramErrorCodes.NO_USERNAME_FOR_GET_SAVED_POSTS_LIMIT_4);

    username = xss(username);

    const { error } = validations.getAllSavedPostsLimit4Validate(username);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_GET_SAVED_POSTS_LIMIT_4_VALIDATION);

    let existingProfile: any = await User.findOne({username: username}).select('-_id profile');

    if(!existingProfile) throw new ErrorResponse(404, 'Profile not found', instagramErrorCodes.PROFILE_NOT_FOUND_FOR_GET_SAVED_POSTS_LIMIT_4);

    let existingUser = await User.findOne({_id: authenticatedUser.id}).select('-_id savePost').populate({
        select: 'post_id',
        path: 'savePost',
        options: {
            limit: 4
        },
        populate: {
            select: 'post',
            path: 'post_id'
        }
    });

    if(!existingUser) throw new ErrorResponse(404, 'User not found', instagramErrorCodes.USER_NOT_FOUND_FOR_GET_SAVED_POSTS_LIMIT_4);
    
    redis.set(`getAllSavedPostsLimit4-${username}`, JSON.stringify({
        status: 'ok', 
        savePost: existingUser.savePost
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', savePost: existingUser.savePost});
}); 

const getAllSavedPosts = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    
    let { username } = mongoSanitize.sanitize(req.params);
    if(!username) throw new ErrorResponse(400, 'Username is required.', instagramErrorCodes.NO_USERNAME_FOR_GET_SAVED_POSTS);

    username = xss(username);

    const { error } = validations.getAllSavedPostsLimit4Validate(username);
    if (error) throw new ErrorResponse(400, error.details[0].message, instagramErrorCodes.INVALID_GET_SAVED_POSTS_VALIDATION);

    let existingProfile: any = await User.findOne({username: username}).select('-_id profile');

    if(!existingProfile) throw new ErrorResponse(404, 'Profile not found', instagramErrorCodes.PROFILE_NOT_FOUND_FOR_GET_SAVED_POSTS);

    let existingUser = await User.findOne({_id: authenticatedUser.id}).select('-_id savePost').populate({
        select: 'post_id',
        path: 'savePost',
        options: { limit: 7 },
        populate: {
            select: 'alt_text caption post likes comments createdAt user_id profile_id',
            path: 'post_id',
            populate: [
                {
                    select: 'username',
                    path: 'user_id'
                },
                {
                    select: 'profilePicture',
                    path: 'profile_id'
                }
            ]
        }
    });

    if(!existingUser) throw new ErrorResponse(404, 'User not found', instagramErrorCodes.USER_NOT_FOUND_FOR_GET_SAVED_POSTS);

    let allPosts = [];

    for(let i = 0; i < existingUser.savePost.length; i++) {
        let { post_id } = JSON.parse(JSON.stringify(existingUser.savePost[i]));
        allPosts.push(post_id);
    }

    const currentUser: any = await User.findOne({_id: authenticatedUser._id}).select('likePost savePost').populate([
        {
            select: 'post_id',
            path: 'likePost'
        },
        {
            select: 'post_id',
            path: 'savePost'
        }
    ]);   

    let updatedAllPosts = [];

    for(let i = 0; i < allPosts.length; i++) {
        let userPost = JSON.parse(JSON.stringify(allPosts[i]));

        let isAuthenticatedUserLikeThisPost: boolean = false;
        let isAuthenticatedUserSaveThisPost: boolean = false;
    
        for(let i = 0; i < currentUser.likePost.length; i++) {
            if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.likePost[i].post_id)) {
                isAuthenticatedUserLikeThisPost = true;
                i = currentUser.likePost.length;
            }
        }   

        for(let i = 0; i < currentUser.savePost.length; i++) {
            if(JSON.stringify(userPost._id) === JSON.stringify(currentUser.savePost[i].post_id)) {
                isAuthenticatedUserSaveThisPost = true;
                i = currentUser.likePost.length;
            }
        }   
    
        if(isAuthenticatedUserLikeThisPost) {
            userPost.isAuthenticatedUserLikeThisPost = true;
        }else {
            userPost.isAuthenticatedUserLikeThisPost = false;
        }

        if(isAuthenticatedUserSaveThisPost) {
            userPost.isAuthenticatedUserSaveThisPost = true;
        }else {
            userPost.isAuthenticatedUserSaveThisPost = false;
        }

        updatedAllPosts.push(userPost);
    }

    redis.set(`getAllSavedPosts-${username}`, JSON.stringify({
        status: 'ok', 
        savePost: updatedAllPosts
    }), {
        EX: 300,
        NX: true
    });
    
    return res.status(200).json({status: 'ok', savePost: updatedAllPosts});
});

const suggestFollowProfiles = tryCatch(async (req: express.Request, res: express.Response) => {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;

    let allFollowing = await User.findOne({_id: authenticatedUser._id}).select('following').populate({
        select: 'profile_id',
        path: 'following',
        populate: {
            select: 'user_id',
            path: 'profile_id'
        }
    });

    let allFollowingUserID = [];

    if(allFollowing !== null) {
        for(let i = 0; i < allFollowing.following.length; i++) {
            const followingUser = JSON.parse(JSON.stringify(allFollowing.following[i]));
            allFollowingUserID.push(followingUser.profile_id.user_id);
        }
    }

    let suggestFollowProfiles = await User.find({
        _id: {
            $ne: authenticatedUser._id,
            $nin: allFollowingUserID
        }
    }).select('-_id username profile').limit(5).populate({
        select: 'fullName profilePicture',
        path: 'profile'  
    });

    redis.set(`suggestFollowProfiles-${authenticatedUser._id}`, JSON.stringify({
        status: 'ok', 
        suggestFollowProfiles: suggestFollowProfiles
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', suggestFollowProfiles: suggestFollowProfiles});
});

export default {
    getUserProfileByUsername,
    getUserPostsProfileByUsername,
    getMoreUserPostsProfileByUsername,
    getAllPosts,
    createNewPost,
    getUserPost,
    followProfile,
    unfollowProfile,
    likePost,
    unlikePost,
    postComment,
    deletePostComment,
    searchUsersByUsername,
    getFollowing,
    getFollowers,
    removeFollower,
    updateProfilePicture,
    updateProfile,
    updatePassword,
    explore,
    moreExplore,
    getAllComments,
    getAllPostsWithCaptionThatContainHashTag,
    getMoreAllPostsWithCaptionThatContainHashTag,
    deletePost,
    updatePost,
    likeComment,
    unlikeComment,
    getAllUsersWhoLikeSpecificComment,
    getAllUsersWhoLikePost,
    savePost,
    unsavePost,
    getAllSavedPostsLimit4,
    getAllSavedPosts,
    suggestFollowProfiles
}