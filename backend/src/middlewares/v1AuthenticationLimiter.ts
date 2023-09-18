import dotenv from 'dotenv';
dotenv.config();
import rateLimit from 'express-rate-limit';
// @ts-ignore
import MongoStore from 'rate-limit-mongo';

export const userLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env["MONGO_DB_URI_LIMITER"] as string, // * MongoDB connection URI
    collectionName: 'user-limits', // * MongoDB collection to store rate limit data
    expireTimeMs: 60 * 1000, // * Time window in milliseconds
    errorHandler: console.error, // * Optional error handler
  }),
  max: 100, // * Maximum number of requests per time window
  message: 'Too many user requests, Please try again later.',
});

export const loginLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env["MONGO_DB_URI_LIMITER"] as string, // * MongoDB connection URI
    collectionName: 'login-limits', // * MongoDB collection to store rate limit data
    expireTimeMs: 60 * 1000, // * Time window in milliseconds
    errorHandler: console.error, // * Optional error handler
  }),
  max: 100, // * Maximum number of requests per time window
  message: 'Too many login requests, Please try again later.',
});

export const verificationCodeLoginLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env["MONGO_DB_URI_LIMITER"] as string, // * MongoDB connection URI
    collectionName: 'verification-code-login-limits', // * MongoDB collection to store rate limit data
    expireTimeMs: 60 * 1000, // * Time window in milliseconds
    errorHandler: console.error, // * Optional error handler
  }),
  max: 100, // * Maximum number of requests per time window
  message: 'Too many verification code login requests, Please try again later.',
});

export const verificationCodeLoginLogoutLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env["MONGO_DB_URI_LIMITER"] as string, // * MongoDB connection URI
    collectionName: 'verification-code-login-logout-limits', // * MongoDB collection to store rate limit data
    expireTimeMs: 60 * 1000, // * Time window in milliseconds
    errorHandler: console.error, // * Optional error handler
  }),
  max: 100, // * Maximum number of requests per time window
  message: 'Too many verification code login logout requests, Please try again later.',
});

export const registerLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env["MONGO_DB_URI_LIMITER"] as string, // * MongoDB connection URI
    collectionName: 'register-limits', // * MongoDB collection to store rate limit data
    expireTimeMs: 60 * 1000, // * Time window in milliseconds
    errorHandler: console.error, // * Optional error handler
  }),
  max: 100, // * Maximum number of requests per time window
  message: 'Too many register requests, Please try again later.',
});

export const activateLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env["MONGO_DB_URI_LIMITER"] as string, // * MongoDB connection URI
    collectionName: 'activate-limits', // * MongoDB collection to store rate limit data
    expireTimeMs: 60 * 1000, // * Time window in milliseconds
    errorHandler: console.error, // * Optional error handler
  }),
  max: 100, // * Maximum number of requests per time window
  message: 'Too many activate requests, Please try again later.',
});

export const logoutLimiter = rateLimit({
  store: new MongoStore({
    uri: process.env["MONGO_DB_URI_LIMITER"] as string, // * MongoDB connection URI
    collectionName: 'logout-limits', // * MongoDB collection to store rate limit data
    expireTimeMs: 60 * 1000, // * Time window in milliseconds
    errorHandler: console.error, // * Optional error handler
  }),
  max: 100, // * Maximum number of requests per time window
  message: 'Too many logout requests, Please try again later.',
});