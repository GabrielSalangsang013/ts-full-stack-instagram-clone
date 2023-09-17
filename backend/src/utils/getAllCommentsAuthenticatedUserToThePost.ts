export default function getAllCommentsAuthenticatedUserToThePost(currentPost: any, authenticatedUserId: any) {
    let authenticatedUserCommentsPost = [];

    for(let i = 0; i < currentPost.comments.length; i++) {
        if(authenticatedUserCommentsPost.length === 5) {
            i = currentPost.comments.length;
        }else {
            if(JSON.stringify(currentPost.comments[i].user_id) === JSON.stringify(authenticatedUserId)) {
                authenticatedUserCommentsPost.push(currentPost.comments[i]);
            }
        }
    }

    currentPost.authenticatedUserCommentsPost = authenticatedUserCommentsPost;

    return currentPost;
}