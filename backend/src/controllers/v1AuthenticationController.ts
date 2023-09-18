import express from 'express';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import Tokens from 'csrf';
import xss from 'xss'; 
import mongoSanitize from 'express-mongo-sanitize';
import lodash from 'lodash';

// * ----------------- MODELS -----------------
import User from '../models/userModel.js';
import Profile from '../models/profileModel.js';
import CSRFTokenSecret from '../models/csrfTokenSecretModel.js';
import GoogleAuthenticator from '../models/googleAuthenticatorModel.js';
// * ----------------- MODELS -----------------

// * ----------------- UTILITIES -----------------
import sendEmail from '../utils/sendEmail.js'; // * FOR SENDING EMAIL TO THE USER
import ErrorResponse from '../utils/ErrorResponse.js'; // * FOR SENDING ERROR TO THE ERROR HANDLER MIDDLEWARE
import tryCatch from "../utils/tryCatch.js"; // * FOR AVOIDING RETYPING TRY AND CATCH IN EACH CONTROLLER
import * as validations from '../utils/v1AuthenticationValidations.js';
import callRedis from '../utils/callRedis.js';
// * ----------------- UTILITIES -----------------

// * ----------------- CONSTANTS -----------------
import * as emailTemplates from '../constants/v1AuthenticationEmailTemplates.js'; // * EMAIL TEMPLATES
import * as errorCodes from '../constants/v1AuthenticationErrorCodes.js'; // * ALL ERROR CODES
import * as cookiesSettings from '../constants/v1AuthenticationCookiesSettings.js'; // * ALL COOKIES SETTINGS
import * as jwtTokensSettings from '../constants/v1AuthenticationJWTTokensSettings.js'; // * ALL JWT TOKEN SETTINGS
import * as userSettings from '../constants/v1AuthenticationUserSettings.js'; // * ALL USER SETTINGS
// * ----------------- CONSTANTS -----------------

const redis = await callRedis();

const user = tryCatch(async (req: express.Request, res: express.Response) => {    
    // * SANITIZED AUTHENTICATED USER INFORMATION BEFORE SENDING - REMOVED _ID FIELD
    let authenticatedUser =  lodash.get(req, 'authenticatedUser') as unknown as any;
    
    // * IF USER HAS GOOGLE AUTH AND IS SCANNED - DON'T SEND ANYMORE THE QR-CODE TO CLIENT
    authenticatedUser = await User.findOne({_id: authenticatedUser._id})
                                    .select('-_id -createdAt -updatedAt')
                                    .populate('profile', 'fullName followers following profilePicture')
                                    .populate('googleAuthenticator', '-_id +qr_code -createdAt -updatedAt');
    if(authenticatedUser.googleAuthenticator) {
        if(authenticatedUser.googleAuthenticator.isActivated) {
            authenticatedUser.googleAuthenticator.qr_code = undefined;
        }
    }

    redis.set(`user-${authenticatedUser._id}`, JSON.stringify({
        status: 'ok', 
        user: authenticatedUser
    }), {
        EX: 300,
        NX: true
    });

    return res.status(200).json({status: 'ok', user: authenticatedUser});
});

const register = tryCatch(async (req: express.Request, res: express.Response) => {
    let {username, email, password, repeatPassword, fullName} = mongoSanitize.sanitize(req.body);
    if(!username || !email || !password || !repeatPassword || !fullName) throw new ErrorResponse(400, "Please complete the Registration Form.", errorCodes.INCOMPLETE_REGISTER_FORM);

    username = xss(username);
    email = xss(email);
    password = xss(password);
    repeatPassword = xss(repeatPassword);
    fullName = xss(fullName);

    const { error } = validations.registerValidate(username, email, password, repeatPassword, fullName);
    if (error) throw new ErrorResponse(400, error.details[0].message, errorCodes.INVALID_USER_INPUT_REGISTER);
    
    let existingUser = await User.findOne({ username });
    if (existingUser) throw new ErrorResponse(400, "Username already exist.", errorCodes.USERNAME_EXIST_REGISTER);

    existingUser = await User.findOne({ email });
    if (existingUser) throw new ErrorResponse(400, "Email already exist.", errorCodes.EMAIL_EXIST_REGISTER);

    const ACCOUNT_ACTIVATION_TOKEN = jwt.sign({username, email, password, repeatPassword, fullName}, process.env["ACCOUNT_ACTIVATION_TOKEN_SECRET"] as string, {expiresIn: jwtTokensSettings.JWT_REGISTER_ACCOUNT_ACTIVATION_EXPIRES_IN_STRING});
    const activateAccountURL = `${process.env["REACT_URL"] as string}/activate/${ACCOUNT_ACTIVATION_TOKEN}`;

    await sendEmail({
        to: email,
        subject: emailTemplates.ACCOUNT_ACTIVATION_EMAIL_SUBJECT,
        text: emailTemplates.ACCOUNT_ACTIVATION_EMAIL_TEXT,
        html: emailTemplates.ACCOUNT_ACTIVATION_EMAIL_HTML(username, activateAccountURL),
    });

    return res.status(200).json({ status: 'ok' });
});

const activate = tryCatch(async (req: express.Request, res: express.Response) => {
    let { token } = mongoSanitize.sanitize(req.body);
    if(!token) throw new ErrorResponse(401, "Incomplete Credential.", errorCodes.NO_ACCOUNT_ACTIVATION_JWT_TOKEN);

    jwt.verify(token, process.env["ACCOUNT_ACTIVATION_TOKEN_SECRET"] as string, (error: any, jwtActivateTokenDecoded: any) => {
        if(error) throw new ErrorResponse(401, "Expired link or Invalid Credential. Please sign up again.", errorCodes.EXPIRED_ACCOUNT_ACTIVATION_JWT_TOKEN_OR_INVALID_ACCOUNT_ACTIVATION_JWT_TOKEN);
        token = jwtActivateTokenDecoded;
    })

    let { username, email, password, repeatPassword, fullName } = mongoSanitize.sanitize(token);
    if(!username || !email || !password || !repeatPassword || !fullName) throw new ErrorResponse(400, "Please complete the Registration Form.", errorCodes.INCOMPLETE_REGISTER_FORM_ACTIVATE);

    username = xss(username);
    email = xss(email);
    password = xss(password);
    repeatPassword = xss(repeatPassword);
    fullName = xss(fullName);

    const { error } = validations.activateValidate(username, email, password, repeatPassword, fullName);
    if (error) throw new ErrorResponse(400, error.details[0].message, errorCodes.INVALID_USER_INPUT_REGISTER_ACTIVATE);

    let existingUser = await User.findOne({ username });
    if (existingUser) throw new ErrorResponse(400, "Account has already been activated.", errorCodes.USERNAME_EXIST_REGISTER_ACTIVATE);

    existingUser = await User.findOne({ email });
    if (existingUser)  throw new ErrorResponse(400, "Account has already been activated.", errorCodes.EMAIL_EXIST_REGISTER_ACTIVATE);
    
    const tokens = new Tokens();
    const csrfTokenSecret = tokens.secretSync();
    const csrfToken = tokens.create(csrfTokenSecret);

    const savedCSRFTokenSecret = await CSRFTokenSecret.create({secret: csrfTokenSecret});
    const savedProfile = await Profile.create({fullName: fullName, profilePicture: userSettings.DEFAULT_PROFILE_PICTURE});
    const savedUser = await User.create({
        username: username, 
        email: email, 
        password: password,
        profile: [savedProfile._id],
        csrfTokenSecret: [savedCSRFTokenSecret._id]
    });

    await CSRFTokenSecret.findOneAndUpdate({_id: savedCSRFTokenSecret._id}, { user_id: savedUser._id });
    await Profile.findOneAndUpdate({_id: savedProfile._id}, { user_id: savedUser._id });

    let authenticationToken = jwt.sign({_id: savedUser._id}, process.env["AUTHENTICATION_TOKEN_SECRET"] as string, {expiresIn: jwtTokensSettings.JWT_AUTHENTICATION_TOKEN_EXPIRATION_STRING});
    
    res.cookie(cookiesSettings.COOKIE_AUTHENTICATION_TOKEN_NAME, authenticationToken, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' , 
        path: '/', 
        expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_AUTHENTICATION_TOKEN_EXPIRATION)
    });

    res.cookie(cookiesSettings.COOKIE_CSRF_TOKEN_NAME, csrfToken, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' , 
        path: '/', 
        expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_AUTHENTICATION_TOKEN_EXPIRATION)
    });

    return res.status(200).json({status: 'ok'});
});

const login = tryCatch(async (req: express.Request, res: express.Response) => {
    let {username, password} = mongoSanitize.sanitize(req.body);
    if(!username || !password) throw new ErrorResponse(400, "Please complete the Login form.", errorCodes.INCOMPLETE_LOGIN_FORM);

    username = xss(username);
    password = xss(password);

    const { error } = validations.loginValidate(username, password);
    if (error) throw new ErrorResponse(400, error.details[0].message, errorCodes.INVALID_USER_INPUT_LOGIN);

    const existingUser = await User.findOne({ username }).select('+password').populate('profile').populate('googleAuthenticator');
    if (!existingUser) throw new ErrorResponse(401, 'Invalid username.', errorCodes.USERNAME_NOT_EXIST_LOGIN);

    const isMatched = await existingUser.matchPasswords(password);
    if (!isMatched) throw new ErrorResponse(401, 'Invalid password.', errorCodes.PASSWORD_NOT_MATCH_LOGIN);

    if (existingUser.isSSO) throw new ErrorResponse(401, 'The user is SSO account.', errorCodes.USER_SSO_ACCOUNT_LOGIN);

    function generateMFACode() {
        return Array.from({ length: 7 }, () => (Math.random() < 0.33 ? String.fromCharCode(Math.floor(Math.random() * 26) + 65) : Math.random() < 0.67 ? String.fromCharCode(Math.floor(Math.random() * 26) + 97) : Math.floor(Math.random() * 10))).join('');
    }

    let sendVerificationCodeLogin = generateMFACode();

    while(!/\d/.test(sendVerificationCodeLogin)) {
        sendVerificationCodeLogin = generateMFACode();
    }
    
    const hashedSendVerificationCodeLogin = await argon2.hash(sendVerificationCodeLogin);

    await User.findOneAndUpdate({ username }, {verificationCodeLogin: hashedSendVerificationCodeLogin});

    await sendEmail({
        to: existingUser.email,
        subject: emailTemplates.MULTI_FACTOR_AUTHENTICATION_LOGIN_ACCOUNT_CODE_EMAIL_SUBJECT,
        text: emailTemplates.MULTI_FACTOR_AUTHENTICATION_LOGIN_ACCOUNT_CODE_EMAIL_TEXT,
        html: emailTemplates.MULTI_FACTOR_AUTHENTICATION_LOGIN_ACCOUNT_CODE_EMAIL_HTML(username, sendVerificationCodeLogin)
    });

    let mfa_token;

    if(existingUser.toObject().hasOwnProperty('googleAuthenticator')) {
        if(existingUser.googleAuthenticator.isActivated) {
            mfa_token = jwt.sign({_id: existingUser._id, username: existingUser.username, profilePicture: existingUser.profile.profilePicture, hasGoogleAuthenticator: true }, process.env["MFA_TOKEN_SECRET"] as string, {expiresIn: jwtTokensSettings.JWT_MFA_LOGIN_TOKEN_EXPIRATION_STRING});
        }else {
            mfa_token = jwt.sign({_id: existingUser._id, username: existingUser.username, profilePicture: existingUser.profile.profilePicture, hasGoogleAuthenticator: false }, process.env["MFA_TOKEN_SECRET"] as string, {expiresIn: jwtTokensSettings.JWT_MFA_LOGIN_TOKEN_EXPIRATION_STRING});
        }
    }else {
        mfa_token = jwt.sign({_id: existingUser._id, username: existingUser.username, profilePicture: existingUser.profile.profilePicture, hasGoogleAuthenticator: false }, process.env["MFA_TOKEN_SECRET"] as string, {expiresIn: jwtTokensSettings.JWT_MFA_LOGIN_TOKEN_EXPIRATION_STRING});
    }
    
    res.cookie(cookiesSettings.COOKIE_MFA_TOKEN_NAME, mfa_token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' , 
        path: '/', 
        expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_MFA_LOGIN_TOKEN_EXPIRATION)
    });

    return res.status(200).json({status: 'ok'});
});

const verificationCodeLogin = tryCatch(async (req: express.Request, res: express.Response) => {
    let {verificationCodeLogin} = mongoSanitize.sanitize(req.body);
    let mfa_token = req.cookies[cookiesSettings.COOKIE_MFA_TOKEN_NAME];

    if(!verificationCodeLogin || !mfa_token) throw new ErrorResponse(400, "Please complete the Login form.", errorCodes.INCOMPLETE_LOGIN_FORM_VERIFICATION_CODE_LOGIN);

    jwt.verify(mfa_token, process.env["MFA_TOKEN_SECRET"] as string, (error: any, jwtMFALoginTokenDecoded: any) => {
        if(error) throw new ErrorResponse(401, "Expired or Incomplete Credential. Please login again.", errorCodes.INVALID_OR_EXPIRED_MULTI_FACTOR_AUTHENTICATION_LOGIN_CODE);
        mfa_token = mongoSanitize.sanitize(jwtMFALoginTokenDecoded._id);
    });

    verificationCodeLogin = xss(verificationCodeLogin);
    mfa_token = xss(mfa_token);

    const { error } = validations.verificationCodeLoginValidate(verificationCodeLogin);
    if (error) throw new ErrorResponse(400, error.details[0].message, errorCodes.INVALID_USER_INPUT_VERIFICATION_CODE_LOGIN);

    const existingUser = await User.findOne({ _id: mfa_token }).select('+verificationCodeLogin').populate('csrfTokenSecret').populate('googleAuthenticator');
    if (!existingUser) throw new ErrorResponse(401, 'User not exist.', errorCodes.USER_NOT_EXIST_VERIFICATION_CODE_LOGIN);

    const isMatchedVerificationCodeLogin = await existingUser.matchVerificationCodeLogin(verificationCodeLogin);
    if (!isMatchedVerificationCodeLogin) throw new ErrorResponse(401, 'Invalid verification code login.', errorCodes.VERIFICATION_CODE_LOGIN_NOT_MATCH);

    const tokens = new Tokens();
    const csrfTokenSecret = existingUser.csrfTokenSecret.secret;
    const csrfToken = tokens.create(csrfTokenSecret);

    let authenticationToken = jwt.sign({_id: existingUser._id}, process.env["AUTHENTICATION_TOKEN_SECRET"] as string, {expiresIn: jwtTokensSettings.JWT_AUTHENTICATION_TOKEN_EXPIRATION_STRING});

    res.cookie(cookiesSettings.COOKIE_AUTHENTICATION_TOKEN_NAME, authenticationToken, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' , 
        path: '/', 
        expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_AUTHENTICATION_TOKEN_EXPIRATION)
    });

    res.cookie(cookiesSettings.COOKIE_CSRF_TOKEN_NAME, csrfToken, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' , 
        path: '/', 
        expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_AUTHENTICATION_TOKEN_EXPIRATION)
    });

    res.cookie(cookiesSettings.COOKIE_MFA_TOKEN_NAME, 'expiredtoken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' , 
        path: '/', 
        expires: new Date(0)
    });

    return res.status(200).json({status: 'ok'});
});

const verificationCodeLoginLogout = tryCatch(async (req: express.Request, res: express.Response) => {
    res.cookie(cookiesSettings.COOKIE_CSRF_TOKEN_NAME, 'expiredtoken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' ,
        path: '/',
        expires: new Date(0)
    });
    
    res.cookie(cookiesSettings.COOKIE_MFA_TOKEN_NAME, 'expiredtoken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' ,
        path: '/',
        expires: new Date(0)
    });

    return res.status(200).json({status: 'ok'});
});

const logout = tryCatch(async (req: express.Request, res: express.Response) => {
    const tokens = new Tokens();
    const csrfTokenSecret = process.env["PUBLIC_CSRF_TOKEN_SECRET"] as string;
    const csrfToken = tokens.create(csrfTokenSecret);

    res.cookie(cookiesSettings.COOKIE_AUTHENTICATION_TOKEN_NAME, 'expiredtoken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none' , 
        path: '/', 
        expires: new Date(0)
    });

    res.cookie(cookiesSettings.COOKIE_CSRF_TOKEN_NAME, csrfToken, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none' , 
        path: '/', 
        expires: new Date(new Date().getTime() + cookiesSettings.COOKIE_PUBLIC_CSRF_TOKEN_EXPIRATION)
    });

    return res.status(200).json({status: 'ok'});
});

export default {
    user,
    register,
    activate,
    login,
    verificationCodeLogin,
    verificationCodeLoginLogout,
    logout
};