import express from 'express';

// * ------------ CONTROLLERS --------------------
import v1AuthenticationController from '../controllers/v1AuthenticationController.js';
// * ------------ CONTROLLERS --------------------

// * ------------ middleware --------------------
import * as middlewareLimiter from '../middlewares/v1AuthenticationLimiter.js';
import * as middleware from '../middlewares/index.js';
// * ------------ middleware --------------------

const router = express.Router();

// * API THAT VERIFY PUBLIC CSRF TOKEN IN THE MIDDLEWARE
router.post('/register', 
    middlewareLimiter.registerLimiter, 
    middleware.verifyPublicCSRFToken, 
    v1AuthenticationController.register);

router.post('/login', 
    middlewareLimiter.loginLimiter, 
    middleware.verifyPublicCSRFToken, 
    v1AuthenticationController.login);

router.post('/activate', 
    middlewareLimiter.activateLimiter, 
    middleware.verifyPublicCSRFToken, 
    v1AuthenticationController.activate);

// * API TWO/MULTI FACTOR AUTHENTICATION
router.post('/verification-code-login', 
    middlewareLimiter.verificationCodeLoginLimiter, 
    middleware.verifyPublicCSRFToken, 
    v1AuthenticationController.verificationCodeLogin);

router.post('/verification-code-login/logout', 
    middlewareLimiter.verificationCodeLoginLogoutLimiter, 
    middleware.verifyPublicCSRFToken, 
    v1AuthenticationController.verificationCodeLoginLogout);

// * API THAT VERIFY PRIVATE CSRF TOKEN FIRST IN THE MIDDLEWARE
router.get('/user', 
    middlewareLimiter.userLimiter, 
    middleware.isMFAMode, 
    middleware.sendPublicCSRFTokenToUser, 
    middleware.isAuthenticated,
    middleware.userCache, 
    v1AuthenticationController.user); 
    
 // * USER MUST BE AUTHETICATED
router.post('/logout', 
    middlewareLimiter.logoutLimiter, 
    middleware.sendPublicCSRFTokenToUser, 
    middleware.isAuthenticated,
    v1AuthenticationController.logout); 

export default router;