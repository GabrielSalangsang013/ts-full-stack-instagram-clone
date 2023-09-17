export default function authenticatedUserFollowingWhoLikePost(currentPost: any, followingProfileIds: any) {
    let authenticatedUserFollowingWhoLikeThisPost = [];

    for(let j = 0; j < currentPost.likes.length; j++) {
        let eachProfileWhoLikeThisPost = JSON.parse(JSON.stringify(currentPost.likes[j].profile._id));

        if(followingProfileIds.includes(eachProfileWhoLikeThisPost)) {
            authenticatedUserFollowingWhoLikeThisPost.push(currentPost.likes[j]);
        }
    }

    currentPost.authenticatedUserFollowingWhoLikeThisPost = authenticatedUserFollowingWhoLikeThisPost;

    return currentPost;
}