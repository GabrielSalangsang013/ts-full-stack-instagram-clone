export default function isAuthenticatedUserLikeThisPost(currentPost: any, authenticatedUserId: any) {
    let isThisPostLikeByAuthenticatedUser = false;
    
    for(let i = 0; i < currentPost.likes.length; i++) {
        if(JSON.stringify(currentPost.likes[i]._id) === JSON.stringify(authenticatedUserId)) {
            isThisPostLikeByAuthenticatedUser = true;
        }
    }

    if(isThisPostLikeByAuthenticatedUser) {
        currentPost.isAuthenticatedUserLikeThisPost = true;
    }else {
        currentPost.isAuthenticatedUserLikeThisPost = false;
    }

    return currentPost;
}