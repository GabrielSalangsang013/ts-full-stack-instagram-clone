import express from 'express';
import fileUpload from 'express-fileupload';

// * ------------ CONTROLLERS --------------------
import v1InstagramController from '../controllers/v1InstagramController.js';
// * ------------ CONTROLLERS --------------------

// * ------------ middleware --------------------
import * as middleware from '../middlewares/index.js';
// * ------------ middleware --------------------

const router = express.Router();
router.use(fileUpload());

 // * USER MUST BE AUTHETICATED
router.get('/profile/:username', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated, 
    middleware.getUserProfileByUsernameCache,
    v1InstagramController.getUserProfileByUsername); 

router.post('/profile/:username', 
    middleware.sendPublicCSRFTokenToUser,         
    middleware.isAuthenticated, 
    middleware.getUserPostsProfileByUsernameCache, 
    v1InstagramController.getUserPostsProfileByUsername); 

router.post('/profile/:username/more', 
    middleware.sendPublicCSRFTokenToUser,         
    middleware.isAuthenticated, 
    v1InstagramController.getMoreUserPostsProfileByUsername); 

router.post('/post', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.createNewPost); 

router.post('/post/all', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.getAllPosts); 

router.get('/post/:post_id', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated, 
    middleware.getUserPostCache,
    v1InstagramController.getUserPost); 

router.post('/follow', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.followProfile); 

router.post('/unfollow', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.unfollowProfile); 

router.post('/post/like', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.likePost); 

router.post('/post/unlike', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.unlikePost); 

router.post('/post/comment', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.postComment); 

router.delete('/post/comment', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.deletePostComment); 

router.get('/search/user/:username', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.searchUsersByUsername); 

router.get('/following/:username', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    middleware.getFollowingCache,
    v1InstagramController.getFollowing); 

router.get('/followers/:profile_id', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    middleware.getFollowersCache,
    v1InstagramController.getFollowers); 

router.post('/follower/remove', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.removeFollower); 

router.put('/user/profile_picture', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.updateProfilePicture); 

router.put('/user/profile', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.updateProfile); 

router.put('/user/password', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.updatePassword); 

router.get('/explore', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    middleware.exploreCache,
    v1InstagramController.explore);

router.post('/more/explore', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.moreExplore);
    
router.get('/comments/:specificPostId', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    middleware.getAllCommentsCache,
    v1InstagramController.getAllComments);

router.get('/explore/tags/:hashtag', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    middleware.getAllPostsWithCaptionThatContainHashTagCache,
    v1InstagramController.getAllPostsWithCaptionThatContainHashTag);

router.post('/explore/tags/hashtag', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.getMoreAllPostsWithCaptionThatContainHashTag);

router.delete('/post', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.deletePost);

router.put('/post', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.updatePost); 

router.post('/like/comment', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.likeComment); 

router.post('/unlike/comment', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.unlikeComment); 

router.get('/post/comment/:comment_id', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    middleware.getAllUsersWhoLikeSpecificCommentCache,
    v1InstagramController.getAllUsersWhoLikeSpecificComment); 

router.get('/post/like/:post_id', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    middleware.getAllUsersWhoLikePostCache,
    v1InstagramController.getAllUsersWhoLikePost); 

router.post('/post/save', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.savePost); 

router.post('/post/unsave', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    v1InstagramController.unsavePost); 

router.get('/profile/:username/saved/all-posts-limit-4', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    middleware.getAllSavedPostsLimit4Cache,
    v1InstagramController.getAllSavedPostsLimit4); 

router.get('/profile/:username/saved/all-posts', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    middleware.getAllSavedPostsCache,
    v1InstagramController.getAllSavedPosts); 

router.get('/suggest/follow/profiles', 
    middleware.sendPublicCSRFTokenToUser,
    middleware.isAuthenticated,
    middleware.suggestFollowProfilesCache,
    v1InstagramController.suggestFollowProfiles); 

export default router;