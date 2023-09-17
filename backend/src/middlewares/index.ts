import express from 'express';
import jwt from 'jsonwebtoken';
import Tokens from 'csrf';
import lodash from 'lodash';

// * ------------ MODELS --------------------
import User from "../models/userModel.js";
// * ------------ MODELS --------------------

// * ------------ CONSTANTS --------------------
import * as cookiesSettings from '../constants/v1AuthenticationCookiesSettings.js'; // * ALL COOKIES SETTINGS
import * as errorCodes from '../constants/v1AuthenticationErrorCodes.js'; // * ALL ERROR CODES
// * ------------ CONSTANTS --------------------

// * ------------ TYPES --------------------
import * as TYPES from '../types/index.js';
import callRedis from '../utils/callRedis.js';
// * ------------ TYPES --------------------

const redis = await callRedis();

export function isMFAMode(req: express.Request, res: express.Response, next: express.NextFunction): any {
    const MFA_LOGIN_TOKEN: string = req.cookies[cookiesSettings.COOKIE_MFA_TOKEN_NAME];

    if (MFA_LOGIN_TOKEN) {
        const MFA_TOKEN_SECRET: string = process.env["MFA_TOKEN_SECRET"] as string;
        try {
            if (jwt.verify(MFA_LOGIN_TOKEN as string, MFA_TOKEN_SECRET)) {
                const { username, profilePicture, hasGoogleAuthenticator }: TYPES.MFA_LOGIN_TOKEN = jwt.decode(MFA_LOGIN_TOKEN) as TYPES.MFA_LOGIN_TOKEN;

                return res.status(200).json({
                    status: 'MFA-Mode', 
                    user: {
                        username, 
                        profilePicture, 
                        hasGoogleAuthenticator
                    }
                });
            }
        } catch (error) {
            // * Handle verification error
        }
    }

    next();
}

export function sendPublicCSRFTokenToUser(req: express.Request, res: express.Response, next: express.NextFunction): any {
    // IF USER DOESN'T HAVE CSRF TOKEN, THE USER WILL RECEIVE A PUBLIC CSRF TOKEN
    const existingCsrfToken = req.cookies[cookiesSettings.COOKIE_CSRF_TOKEN_NAME];

    if (existingCsrfToken === null || existingCsrfToken === undefined) {
        const tokens = new Tokens();
        const csrfTokenSecret = process.env["PUBLIC_CSRF_TOKEN_SECRET"] as string;
        const csrfToken = tokens.create(csrfTokenSecret);

        res.cookie(cookiesSettings.COOKIE_CSRF_TOKEN_NAME, csrfToken, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'none' , 
            path: '/', 
            expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_PUBLIC_CSRF_TOKEN_EXPIRATION)
        });
    }

    next();
}

export function isAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction): any {
    const authenticationToken: string = req.cookies[cookiesSettings.COOKIE_AUTHENTICATION_TOKEN_NAME];
    const csrfToken:any = req.cookies[cookiesSettings.COOKIE_CSRF_TOKEN_NAME];
    const tokens = new Tokens();

    if (authenticationToken == null) {
        // NOT AUTHENTICATED USER
        if (!tokens.verify(process.env["PUBLIC_CSRF_TOKEN_SECRET"] as string, csrfToken)) {
            const csrfTokenSecret = process.env["PUBLIC_CSRF_TOKEN_SECRET"] as string;
            const csrfToken:any = tokens.create(csrfTokenSecret);
        
            res.cookie(cookiesSettings.COOKIE_CSRF_TOKEN_NAME, csrfToken, { 
                httpOnly: true, 
                secure: true, 
                sameSite: 'none' , 
                path: '/', 
                expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_PUBLIC_CSRF_TOKEN_EXPIRATION)
            });
        }

        return res.status(401).json({message: 'Invalid Credential.', errorCode: errorCodes.NO_JWT_TOKEN_AUTHENTICATE_JWT_TOKEN});
    }

    jwt.verify(authenticationToken, process.env["AUTHENTICATION_TOKEN_SECRET"] as string, async (error: any, authenticatedUser: any): Promise<any> => {
        if (error) {
            // THE USER HAS JWT TOKEN BUT INVALID
            res.cookie(cookiesSettings.COOKIE_AUTHENTICATION_TOKEN_NAME, 'expiredtoken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none' , 
                path: '/', 
                expires: new Date(0)
            });
    
            const csrfTokenSecret = process.env["PUBLIC_CSRF_TOKEN_SECRET"] as string;
            const csrfToken:any = tokens.create(csrfTokenSecret);
        
            res.cookie(cookiesSettings.COOKIE_CSRF_TOKEN_NAME, csrfToken, { 
                httpOnly: true, 
                secure: true, 
                sameSite: 'none' , 
                path: '/', 
                expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_PUBLIC_CSRF_TOKEN_EXPIRATION)
            });

            return res.status(403).json({message: 'Invalid Credential.', errorCode: errorCodes.INVALID_JWT_TOKEN_AUTHENTICATE_JWT_TOKEN});
        }

        let existingUser = await User.findOne({_id: authenticatedUser._id})
                                        .select('-username -email -isSSO -createdAt -updatedAt')
                                        .populate('profile', '-fullName -profilePicture -posts -createdAt -updatedAt')
                                        .populate('csrfTokenSecret')
                                        .populate('googleAuthenticator', '-isActivated -createdAt -updatedAt');
        if (!existingUser) return res.status(404).json({message: "Invalid Credential.", errorCode: errorCodes.NO_USER_FOUND_IN_DATABASE_INSIDE_JWT_DECODED_TOKEN_AUTHENTICATE_JWT_TOKEN});
        if (!tokens.verify(existingUser.csrfTokenSecret.secret, csrfToken)) {
            // THE USER HAS CSRF TOKEN BUT INVALID
            res.cookie(cookiesSettings.COOKIE_AUTHENTICATION_TOKEN_NAME, 'expiredtoken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none' , 
                path: '/', 
                expires: new Date(0)
            });
        
            const csrfTokenSecret = process.env["PUBLIC_CSRF_TOKEN_SECRET"] as string;
            const csrfToken:any = tokens.create(csrfTokenSecret);
        
            res.cookie(cookiesSettings.COOKIE_CSRF_TOKEN_NAME, csrfToken, { 
                httpOnly: true, 
                secure: true, 
                sameSite: 'none' , 
                path: '/', 
                expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_PUBLIC_CSRF_TOKEN_EXPIRATION)
            });
            
            return res.status(403).json({message: 'Invalid Credential.', errorCode: errorCodes.INVALID_CSRF_TOKEN_VERIFY_PRIVATE_CSRF_TOKEN});
        }

        // * WE NO LONGER NEED CSRF TOKEN SECRET - THE USER IS REALLY AUTHENTICED USER
        existingUser.csrfTokenSecret = undefined;

        // * EXISTING USER - FINAL DATA - WE DON'T SEND THIS, WE HOLD THIS DATA FOR UPDATE PURPOSES
        // * {
        // *    _id: ObjectId,
        // *    profile: {
        // *        _id: ObjectId
        // *    },
        // *    googleAuthenticator?: {
        // *        _id: ObjectId,    
        // *    }
        // * }
        
        lodash.merge(req, { authenticatedUser: existingUser });
        next();
    });
}

export function verifyPublicCSRFToken(req: express.Request, res: express.Response, next: express.NextFunction): any {
    const csrfToken:any = req.cookies[cookiesSettings.COOKIE_CSRF_TOKEN_NAME];
    const tokens = new Tokens();

    if (csrfToken == null) {
        // THE USER HAS NO CSRF TOKEN
        const csrfTokenSecret = process.env["PUBLIC_CSRF_TOKEN_SECRET"] as string;
        const csrfToken:any = tokens.create(csrfTokenSecret);
    
        res.cookie(cookiesSettings.COOKIE_CSRF_TOKEN_NAME, csrfToken, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'none' , 
            path: '/',
            expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_PUBLIC_CSRF_TOKEN_EXPIRATION)
        });

        return res.status(401).json({message: 'Invalid Credential.', errorCode: errorCodes.NO_CSRF_TOKEN_VERIFY_PUBLIC_CSRF_TOKEN});
    }

    if (!tokens.verify(process.env["PUBLIC_CSRF_TOKEN_SECRET"] as string, csrfToken)) {
        // THE USER HAS CSRF TOKEN BUT INVALID 
        const csrfTokenSecret = process.env["PUBLIC_CSRF_TOKEN_SECRET"] as string;
        const csrfToken:any = tokens.create(csrfTokenSecret);
    
        res.cookie(cookiesSettings.COOKIE_CSRF_TOKEN_NAME, csrfToken, { 
            httpOnly: true, 
            secure: true, 
            sameSite: 'none' , 
            path: '/',
            expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_PUBLIC_CSRF_TOKEN_EXPIRATION)
        });
        
        return res.status(403).json({message: 'Invalid Credential.', errorCode: errorCodes.INVALID_CSRF_TOKEN_VERIFY_PUBLIC_CSRF_TOKEN});
    }

    next();
}

// MIDDLEWARES CACHE 

export async function userCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let data = await redis.get(`user-${authenticatedUser._id}`);

    if (data !== null) {
        let { status, user }: any = JSON.parse(data);

        res.status(200).json({
            status,
            user
        });
    } else {
      next();
    }
}

export async function getUserProfileByUsernameCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    const { username } = req.params;
    let data = await redis.get(`getUserProfileByUsername-${authenticatedUser._id}-${username}`);

    if (data !== null) {
        let { status, isOwned, userProfile, isAuthenticatedUserFollowThisProfile, authenticatedUserFollowingWhoFollowingThisProfile }: any = JSON.parse(data);

        if(JSON.stringify(authenticatedUser._id) === JSON.stringify(userProfile.profile.user_id)) {
            res.status(200).json({
                status,
                userProfile, 
                isOwned
            });
        }else {
            res.status(200).json({
                status,
                userProfile, 
                isOwned,
                isAuthenticatedUserFollowThisProfile,
                authenticatedUserFollowingWhoFollowingThisProfile
            });
        }
    } else {
      next();
    }
}

export async function getUserPostsProfileByUsernameCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { username } = req.params;
    let data = await redis.get(`getUserPostsProfileByUsername-${username}`);

    if (data !== null) {
        let { status, allPosts, length }: any = JSON.parse(data);

        res.status(200).json({
            status,
            allPosts,
            length
        });
    } else {
      next();
    }
}

export async function getUserPostCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    const { post_id } = req.params;
    let data = await redis.get(`getUserPost-${post_id}`);

    if (data !== null) {
        let { status, userPost }: any = JSON.parse(data);

        res.status(200).json({
            status,
            userPost
        });
    } else {
      next();
    }
}

export async function getFollowingCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let { username } = req.params;
    let data = await redis.get(`getFollowing-${username}`);

    if (data !== null) {
        let { status, following }: any = JSON.parse(data);

        res.status(200).json({
            status,
            following
        });
    } else {
      next();
    }
}

export async function getFollowersCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let { profile_id } = req.params;
    let data = await redis.get(`getFollowers-${profile_id}`);

    if (data !== null) {
        let { status, followers }: any = JSON.parse(data);

        res.status(200).json({
            status,
            followers
        });
    } else {
      next();
    }
}

export async function exploreCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    let data = await redis.get(`explore-${authenticatedUser._id}`);

    if (data !== null) {
        let { status, nestedAllPosts, allPosts, length }: any = JSON.parse(data);

        res.status(200).json({
            status,
            nestedAllPosts,
            allPosts,
            length
        });
    } else {
      next();
    }
}

export async function getAllCommentsCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let { specificPostId } = req.params;

    let data = await redis.get(`getAllComments-${specificPostId}`);

    if (data !== null) {
        let { status, comments }: any = JSON.parse(data);

        res.status(200).json({
            status,
            comments
        });
    } else {
      next();
    }
}

export async function getAllPostsWithCaptionThatContainHashTagCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let { hashtag } = req.params;

    let data = await redis.get(`getAllPostsWithCaptionThatContainHashTag-${hashtag}`);

    if (data !== null) {
        let { status, allPosts, length }: any = JSON.parse(data);

        res.status(200).json({
            status,
            allPosts,
            length
        });
    } else {
      next();
    }
}

export async function getAllUsersWhoLikeSpecificCommentCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let { comment_id } = req.params;

    let data = await redis.get(`getAllUsersWhoLikeSpecificComment-${comment_id}`);

    if (data !== null) {
        let { status, allUsers }: any = JSON.parse(data);

        res.status(200).json({
            status,
            allUsers
        });
    } else {
      next();
    }
}

export async function getAllUsersWhoLikePostCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let { post_id } = req.params;

    let data = await redis.get(`getAllUsersWhoLikePost-${post_id}`);

    if (data !== null) {
        let { status, allUsers }: any = JSON.parse(data);

        res.status(200).json({
            status, 
            allUsers
        });
    } else {
      next();
    }
}

export async function getAllSavedPostsLimit4Cache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let { username } = req.params;

    let data = await redis.get(`getAllSavedPostsLimit4-${username}`);

    if (data !== null) {
        let { status, savePost }: any = JSON.parse(data);

        res.status(200).json({
            status, 
            savePost
        });
    } else {
      next();
    }
}

export async function getAllSavedPostsCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let { username } = req.params;

    let data = await redis.get(`getAllSavedPosts-${username}`);

    if (data !== null) {
        let { status, savePost }: any = JSON.parse(data);

        res.status(200).json({
            status, 
            savePost
        });
    } else {
      next();
    }
}

export async function suggestFollowProfilesCache(req: express.Request, res: express.Response, next: express.NextFunction) {
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;

    let data = await redis.get(`suggestFollowProfiles-${authenticatedUser._id}`);

    if (data !== null) {
        let { status, suggestFollowProfiles }: any = JSON.parse(data);

        res.status(200).json({
            status, 
            suggestFollowProfiles
        });
    } else {
      next();
    }
}