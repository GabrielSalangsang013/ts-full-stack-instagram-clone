import OptimizeImage from "@/helpers/optimizedImage";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import handleTimeDifference from "@/helpers/timeDifference";

import { Splide, SplideSlide } from '@splidejs/react-splide';
import { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import replaceMentionsAndHashtagsWithLinks from '@/helpers/replaceMentionsAndHashtagsWithLinks';

import { useRef, useCallback } from 'react';
import SkeletonHomePost from '@/components/SkeletonHomePost';
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(
    () => {
      return import('emoji-picker-react');
    },
    { ssr: false }
);

const HomeAllPosts = ({authenticatedUser}: any) => {
    
    const [fetchingFirstAllPosts, setFetchingFirstAllPosts] = useState<boolean>(false);
    const [fetchingMorePosts, setFetchingMorePosts] = useState<boolean>(false);
    const [allPostsId, setAllPostsId] = useState<any>([]);
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(false);
    const [allPosts,setAllPosts] = useState<any>([]);

    const handleLikePost = async (post_id: string, e: any) => {
        try {
            let target = e.target;

            if(target.getAttribute('data-type-function') === 'like') {
                target.innerHTML = `<svg style="pointer-events: none" aria-label="Unlike" color="rgb(255, 48, 64)" fill="rgb(255, 48, 64)" height="24" role="img" viewBox="0 0 48 48" width="24"><title>Unlike</title><path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path></svg>`
                target.setAttribute('data-type-function', 'unlike');

                let getTotalLikesPostContainer: any = document.querySelector(`[data-type-post-id-total-likes-container="${post_id}"]`);
                let totalLikes = getTotalLikesPostContainer.getAttribute('data-type-total-likes');
                getTotalLikesPostContainer.innerText = (Number(totalLikes) + 1) + " " + "likes";
                getTotalLikesPostContainer.setAttribute('data-type-total-likes', Number(totalLikes) + 1);

                try {
                    const settings: object = {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            post_id: post_id
                        })
                    }
        
                    const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post/like`, settings);
                    const result = await response.json();
        
                    if(result.status === 'ok') {
                        
                    }else {
                        alert('failed');
                    }
                }catch(error) {
                    alert(error);
                }
                    
            }else {
                target.innerHTML = `<svg style="pointer-events: none" aria-label="Like" color="rgb(38, 38, 38)" fill="rgb(38, 38, 38)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Like</title><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg>`
                target.setAttribute('data-type-function', 'like');

                let getTotalLikesPostContainer: any = document.querySelector(`[data-type-post-id-total-likes-container="${post_id}"]`);
                let totalLikes = getTotalLikesPostContainer.getAttribute('data-type-total-likes');
                getTotalLikesPostContainer.innerText = (Number(totalLikes) - 1) + " " + "likes";
                getTotalLikesPostContainer.setAttribute('data-type-total-likes', Number(totalLikes) - 1);

                try {
                    const settings: object = {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            post_id: post_id
                        })
                    }
        
                    const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post/unlike`, settings);
                    const result = await response.json();
        
                    if(result.status === 'ok') {
                        
                    }else {
                        alert('failed');
                    }
                }catch(error) {
                    alert(error);
                }
            }
        }catch(e) {
            console.log(e);
        }
    }

    const handleInputCommentPost = (target: any, autoCloseEmojiContainer: boolean = true) => {
        if(target.value.length > 0) {
            target.parentElement.parentElement.childNodes[1].style.display = 'block';
        }else {
            target.parentElement.parentElement.childNodes[1].style.display = 'none';
        }

        if(autoCloseEmojiContainer) {
            let emojiContainer = target.parentElement.parentElement.childNodes[2].childNodes[1];

            if(emojiContainer.style.display === 'block') {
                emojiContainer.style.display = 'none';
            }
        }
    
        target.style.height = "5px";
        target.style.height = (target.scrollHeight) + "px";
    }

    const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent, post_input_comment_id: string) => {
        let postCommentInput = document.getElementById(post_input_comment_id);
    
        if (postCommentInput !== null && postCommentInput instanceof HTMLTextAreaElement) {
            postCommentInput.value += emojiData.emoji;
            handleInputCommentPost(postCommentInput, false);
        }
    }

    const handleShowEmojiPicker = (e: any) => {
        let currentEmojiPickerIcon = e.target;
        let currentEmojiPickerContainer = currentEmojiPickerIcon.parentElement.childNodes[1];
        
        if(currentEmojiPickerContainer.style.display === "none") {
            currentEmojiPickerContainer.style.display = 'block';
        }else {
            currentEmojiPickerContainer.style.display = 'none';
        }
    }

    const handleCloseEmojiContainer = (target: any) => {
        let emojiContainer = target.parentElement.parentElement.childNodes[2].childNodes[1];

        if(emojiContainer.style.display === 'block') {
            emojiContainer.style.display = 'none';
        }
    }

    const handleSubmitComment = async (post_id: string, e: any, authenticatedUserUsername: string) => {
        let currentTextArea = e.target.parentElement.childNodes[0].childNodes[0];
        let commentContainer = e.target.parentElement.parentElement.childNodes[4];

        commentContainer.style.display = 'block';

        let newComment = `
            <div class="flex justify-between mb-2 items-center">
                <div class="flex-1">
                    <a href="/${authenticatedUserUsername}">
                        <span class="text-[14px] font-semibold">${authenticatedUserUsername} </span>
                    </a>
                    <span class="text-[14px]">${currentTextArea.value}</span>
                </div>
                <div>
                    <svg aria-label="Like" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="13" role="img" viewBox="0 0 24 24" width="13">
                        <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                    </svg>
                </div>
            </div>
        `

        commentContainer.insertAdjacentHTML("beforeend", newComment);
        
        try {
            const settings: object = {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    post_id: post_id,
                    comment: currentTextArea.value
                })
            }

            currentTextArea.value = '';

            const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post/comment`, settings);
            const result = await response.json();

            if(result.status === 'ok') {
                alert('success');
            }else {
                alert('failed');
            }
        }catch(error) {
            alert(error);
        }
    }

    const showMore = async () => {
        setFetchingMorePosts(true);

        const response2 = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post/all`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                allPostsId: allPostsId
            })
        });

        const { allPosts, length } = await response2.json();

        let seenAllPosts: string[] = [];

        for(let i = 0; i < allPosts.length; i++) {
            seenAllPosts.push(allPosts[i]._id);
        }

        if(length <= 0) {
            setHasMorePosts(false);
        }

        setFetchingMorePosts(false);
        setAllPostsId([...allPostsId, ...seenAllPosts]);
        setAllPosts((previous: any) => [...previous, ...allPosts]);
    }

    const observer: any = useRef();

    const lastPostElementRef = useCallback((node: HTMLDivElement) => {
        if (fetchingMorePosts) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMorePosts) {
                showMore();
            }
        })
        if (node) observer.current.observe(node);

    }, [allPostsId, fetchingMorePosts, hasMorePosts]);

    useEffect(() => {
        setFetchingFirstAllPosts(true);
        (async() => {
            const response2 = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post/all`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    allPostsId: []
                })
            });

            const { allPosts, length } = await response2.json();

            let seenAllPosts = [];

            for(let i = 0; i < allPosts.length; i++) {
                seenAllPosts.push(allPosts[i]._id);
            }

            if(length > 0) {
                setHasMorePosts(true);
            }

            setAllPostsId(seenAllPosts);
            setAllPosts(allPosts);
            setFetchingFirstAllPosts(false);
        })();
    }, []);

    return (
        <div className='max-w-[630px] w-full flex flex-col'>
            {
                fetchingFirstAllPosts ?
                <>
                    <SkeletonHomePost />
                    <SkeletonHomePost />
                    <SkeletonHomePost />
                </>
                :
                <>
                    <div className='w-full flex flex-col items-center'>
                        {
                            allPosts.map((eachPost: any, index: number) => {
                                if(allPosts.length === index + 1) {
                                    return <article key={index} ref={lastPostElementRef} className='w-[470px]'>
                                        <header className='flex gap-[10px] justify-center items-center mb-4'>
                                            <div className='w-[42px] h-[42px]'>
                                                <Link href={`/${eachPost.user_id.username}`}>
                                                    <Image width={42} height={42} src={OptimizeImage(eachPost.profile_id.profilePicture, ['w_64', 'h_64', 'c_fill'])} crossOrigin='anonymous' className='w-full h-full object-cover rounded-[50%] border-[2px] border-[#f1f1f1]' alt="User Profile Picture" />
                                                </Link>
                                            </div>
                                            <div className='flex-1 h-[42px] flex flex-col justify-center'>
                                                <div className='flex gap-[8px] items-center'>
                                                    <Link href={`/${eachPost.user_id.username}`}><span className='text-[14px] font-semibold'>{eachPost.user_id.username}</span></Link>
                                                    <span className='text-neutral-500'>•</span>
                                                    <span className='text-neutral-500 text-[14px]'>{handleTimeDifference(eachPost.createdAt)}</span>
                                                </div>
                                                <span className='text-[12px]'>Original Post</span>
                                            </div>
                                            <div className='w-[32px] h-[32px] flex items-center justify-end'>
                                                <svg aria-label="More options" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle></svg>
                                            </div>
                                        </header>
                                        <main className='w-full mb-4'>
                                            <Splide options={ { rewind: true, arrows: eachPost.post.length > 1, drag: false } } aria-label="React Splide Example">
                                                {eachPost.post.map((currentEachPost: any, index: number) => (
                                                    <SplideSlide key={index}>
                                                        {currentEachPost.type === 'video/mp4' ? 
                                                            <div className="w-full h-full flex items-center justify-center bg-black">
                                                                <video crossOrigin='anonymous' src={currentEachPost.post} className="w-full object-fill max-h-[600px] w-[auto]" controls/>
                                                            </div>
                                                            : 
                                                            <div className="w-full h-full flex items-center justify-center bg-black">
                                                                <Image priority width={600} height={600} crossOrigin="anonymous" src={currentEachPost.post} alt={eachPost.alt_text} className="w-full object-fill max-h-[600px] w-[auto]"/>
                                                            </div>
                                                        }
                                                    </SplideSlide>
                                                ))}
                                            </Splide>
                                        </main>
                                        <footer className='w-full border-b mb-6 border-b-neutral-200'>
                                            <div className='flex justify-between'>
                                                <div className='flex items-center'>   
                                                    <button type="button" onClick={(e: any) => {handleLikePost(eachPost._id, e)}} data-type-function={eachPost.isAuthenticatedUserLikeThisPost ? 'unlike' : 'like'} className='bg-transparent border-0 mr-4'>
                                                        {eachPost.isAuthenticatedUserLikeThisPost ? 
                                                            <svg style={{pointerEvents: 'none'}} aria-label="Unlike" color="rgb(255, 48, 64)" fill="rgb(255, 48, 64)" height="24" role="img" viewBox="0 0 48 48" width="24"><title>Unlike</title><path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path></svg>
                                                            :
                                                            <svg style={{pointerEvents: 'none'}} aria-label="Like" color="rgb(38, 38, 38)" fill="rgb(38, 38, 38)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Like</title><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg>
                                                        }
                                                    </button>

                                                    <Link className='w-[24px] h-[24px]' href={`/post/${eachPost._id}`}>
                                                        <button type="button" className='bg-transparent border-0'>
                                                            <svg aria-label="Comment" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Comment</title><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                                        </button>
                                                    </Link>
                                                </div>
                                                <div>
                                                    <button type="button" className='bg-transparent border-0'>
                                                        <svg aria-label="Save" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Save</title><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className='flex items-center'>
                                                {
                                                    eachPost.authenticatedUserFollowingWhoLikeThisPost.length > 0 && 
                                                    <>
                                                        <div className={`w-[${eachPost.authenticatedUserFollowingWhoLikeThisPost.length * 14}px] h-[20px] relative flex items-center`}>
                                                            {
                                                                eachPost.authenticatedUserFollowingWhoLikeThisPost.map((eachAuthenticatedUserFollowingWhoLikeThisPost: any, index: number) => (
                                                                    <Image width={14} height={14} key={index} style={{position: 'absolute', left: `${index * 10}px`, zIndex: index}} className={`w-[14px] h-[14px] rounded-[50%] object-cover`} crossOrigin='anonymous' src={eachAuthenticatedUserFollowingWhoLikeThisPost.user_id.profile.profilePicture} alt="" />
                                                                ))
                                                            }
                                                        </div>
                                                    </>
                                                }
                                                <span data-type-total-likes={eachPost.likes.length} data-type-post-id-total-likes-container={eachPost._id} className={`text-[14px] font-semibold ${eachPost.authenticatedUserFollowingWhoLikeThisPost.length === 1 && 'ml-2'}`}>{eachPost.likes.length} likes</span>
                                            </div>

                                            <div className='mb-1'>
                                                <Link href={`/${eachPost.user_id.username}`}><span className='text-[14px] font-semibold'>{eachPost.user_id.username} </span></Link>
                                                <span className='text-[14px] whitespace-pre-line' dangerouslySetInnerHTML={replaceMentionsAndHashtagsWithLinks(eachPost.caption)}></span>
                                            </div>

                                            {
                                                eachPost.comments.length > 0 ?
                                                <div className='mb-1'>
                                                    <Link href={`/post/${eachPost._id}`}>
                                                        {eachPost.comments.length === 1 ? 
                                                            <span className='text-[14px] text-neutral-500'>View {eachPost.comments.length} comment</span>
                                                            :
                                                            <span className='text-[14px] text-neutral-500'>View all {eachPost.comments.length} comments</span>
                                                        }
                                                    </Link>
                                                </div> :
                                                <div className='mb-1'>
                                                    <span className='text-[14px] text-neutral-500'>No comments</span>
                                                </div>
                                            }

                                            <div>
                                                {
                                                    eachPost.authenticatedUserCommentsPost.map((authenticatedUserComment: any, index: number) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <div className="flex-1">
                                                                <Link href={`/${authenticatedUserComment.user_id.username}`}>
                                                                    <span className="text-[14px] font-semibold">{authenticatedUserComment.user_id.username} </span>
                                                                </Link>
                                                                <span className="text-[14px]">{authenticatedUserComment.comment}</span>
                                                            </div>
                                                            <div className="">
                                                                <svg aria-label="Like" color="rgb(142, 142, 142)" fill="rgb(142, 142, 142)" height="16" role="img" viewBox="0 0 24 24" width="16"><title>Like</title><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>

                                            <div className='flex gap-2 mt-2'>
                                                <div className='flex-1'>
                                                    <textarea id={`post-input-comment-id-${eachPost._id}`} className='w-full min-h-[50px] text-[14px] resize-none focus:outline-0' onClick={(e) => {handleCloseEmojiContainer(e.target)}}  onInput={(e) => {handleInputCommentPost(e.target)}} placeholder='Add a comment...'></textarea>
                                                </div>
                                                <button type="button" onClick={(e) => handleSubmitComment(eachPost._id, e, authenticatedUser.username)} style={{display: 'none'}} className='h-[14px] bg-transparent border-0 text-[#0099FF] text-[14px] font-medium'>Post</button>
                                                <div className='relative'>
                                                    <button onClick={handleShowEmojiPicker} type='button' className='bg-transparent border-0'>
                                                        <svg style={{pointerEvents: 'none'}} aria-label="Emoji" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="13" role="img" viewBox="0 0 24 24" width="13"><title>Emoji</title><path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path></svg>
                                                    </button>
                                                    <div style={{display: 'none'}} className='absolute top-[-450px] left-[-300px]'>
                                                        <EmojiPicker emojiStyle={EmojiStyle.NATIVE} onEmojiClick={(emojiData, event) => {
                                                            onEmojiClick(emojiData, event, `post-input-comment-id-${eachPost._id}`)
                                                        }} width={300} height={450}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </footer>
                                    </article>
                                }else {
                                    return <article key={index} className='w-[470px]'>
                                        <header className='flex gap-[10px] justify-center items-center mb-4'>
                                            <div className='w-[42px] h-[42px]'>
                                                <Link href={`/${eachPost.user_id.username}`}>
                                                    <Image width={42} height={42} src={OptimizeImage(eachPost.profile_id.profilePicture, ['w_64', 'h_64', 'c_fill'])} crossOrigin='anonymous' className='w-full h-full object-cover rounded-[50%] border-[2px] border-[#f1f1f1]' alt="User Profile Picture" />
                                                </Link>
                                            </div>
                                            <div className='flex-1 h-[42px] flex flex-col justify-center'>
                                                <div className='flex gap-[8px] items-center'>
                                                    <Link href={`/${eachPost.user_id.username}`}><span className='text-[14px] font-semibold'>{eachPost.user_id.username}</span></Link>
                                                    <span className='text-neutral-500'>•</span>
                                                    <span className='text-neutral-500 text-[14px]'>{handleTimeDifference(eachPost.createdAt)}</span>
                                                </div>
                                                <span className='text-[12px]'>Original Post</span>
                                            </div>
                                            <div className='w-[32px] h-[32px] flex items-center justify-end'>
                                                <svg aria-label="More options" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle></svg>
                                            </div>
                                        </header>
                                        <main className='w-full mb-4'>
                                            <Splide options={ { rewind: true, arrows: eachPost.post.length > 1, drag: false } } aria-label="React Splide Example">
                                                {eachPost.post.map((currentEachPost: any, index: number) => (
                                                    <SplideSlide key={index}>
                                                        {currentEachPost.type === 'video/mp4' ? 
                                                            <div className="w-full h-full flex items-center justify-center bg-black">
                                                                <video crossOrigin='anonymous' src={currentEachPost.post} className="w-full object-fill max-h-[600px] w-[auto]" controls/>
                                                            </div>
                                                            : 
                                                            <div className="w-full h-full flex items-center justify-center bg-black">
                                                                <Image priority width={600} height={600} crossOrigin="anonymous" src={currentEachPost.post} alt={eachPost.alt_text} className="w-full object-fill max-h-[600px] w-[auto]"/>
                                                            </div>
                                                        }
                                                    </SplideSlide>
                                                ))}
                                            </Splide>
                                        </main>
                                        <footer className='w-full border-b mb-6 border-b-neutral-200'>
                                            <div className='flex justify-between'>
                                                <div className='flex items-center'>   
                                                    <button type="button" onClick={(e: any) => {handleLikePost(eachPost._id, e)}} data-type-function={eachPost.isAuthenticatedUserLikeThisPost ? 'unlike' : 'like'} className='bg-transparent border-0 mr-4'>
                                                        {eachPost.isAuthenticatedUserLikeThisPost ? 
                                                            <svg style={{pointerEvents: 'none'}} aria-label="Unlike" color="rgb(255, 48, 64)" fill="rgb(255, 48, 64)" height="24" role="img" viewBox="0 0 48 48" width="24"><title>Unlike</title><path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path></svg>
                                                            :
                                                            <svg style={{pointerEvents: 'none'}} aria-label="Like" color="rgb(38, 38, 38)" fill="rgb(38, 38, 38)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Like</title><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg>
                                                        }
                                                    </button>

                                                    <Link className='w-[24px] h-[24px]' href={`/post/${eachPost._id}`}>
                                                        <button type="button" className='bg-transparent border-0'>
                                                            <svg aria-label="Comment" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Comment</title><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                                        </button>
                                                    </Link>
                                                </div>
                                                <div>
                                                    <button type="button" className='bg-transparent border-0'>
                                                        <svg aria-label="Save" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Save</title><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className='flex items-center'>
                                                {
                                                    eachPost.authenticatedUserFollowingWhoLikeThisPost.length > 0 && 
                                                    <>
                                                        <div className={`w-[${eachPost.authenticatedUserFollowingWhoLikeThisPost.length * 14}px] h-[20px] relative flex items-center`}>
                                                            {
                                                                eachPost.authenticatedUserFollowingWhoLikeThisPost.map((eachAuthenticatedUserFollowingWhoLikeThisPost: any, index: number) => (
                                                                    <Image width={14} height={14} key={index} style={{position: 'absolute', left: `${index * 10}px`, zIndex: index}} className={`w-[14px] h-[14px] rounded-[50%] object-cover`} crossOrigin='anonymous' src={eachAuthenticatedUserFollowingWhoLikeThisPost.user_id.profile.profilePicture} alt="" />
                                                                ))
                                                            }
                                                        </div>
                                                    </>
                                                }
                                                <span data-type-total-likes={eachPost.likes.length} data-type-post-id-total-likes-container={eachPost._id} className={`text-[14px] font-semibold ${eachPost.authenticatedUserFollowingWhoLikeThisPost.length === 1 && 'ml-2'}`}>{eachPost.likes.length} likes</span>
                                            </div>

                                            <div className='mb-1'>
                                                <Link href={`/${eachPost.user_id.username}`}><span className='text-[14px] font-semibold'>{eachPost.user_id.username} </span></Link>
                                                <span className='text-[14px] whitespace-pre-line' dangerouslySetInnerHTML={replaceMentionsAndHashtagsWithLinks(eachPost.caption)}></span>
                                            </div>

                                            {
                                                eachPost.comments.length > 0 ?
                                                <div className='mb-1'>
                                                    <Link href={`/post/${eachPost._id}`}>
                                                        {eachPost.comments.length === 1 ? 
                                                            <span className='text-[14px] text-neutral-500'>View {eachPost.comments.length} comment</span>
                                                            :
                                                            <span className='text-[14px] text-neutral-500'>View all {eachPost.comments.length} comments</span>
                                                        }
                                                    </Link>
                                                </div> :
                                                <div className='mb-1'>
                                                    <span className='text-[14px] text-neutral-500'>No comments</span>
                                                </div>
                                            }

                                            <div>
                                                {
                                                    eachPost.authenticatedUserCommentsPost.map((authenticatedUserComment: any, index: number) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <div className="flex-1">
                                                                <Link href={`/${authenticatedUserComment.user_id.username}`}>
                                                                    <span className="text-[14px] font-semibold">{authenticatedUserComment.user_id.username} </span>
                                                                </Link>
                                                                <span className="text-[14px]">{authenticatedUserComment.comment}</span>
                                                            </div>
                                                            <div className="">
                                                                <svg aria-label="Like" color="rgb(142, 142, 142)" fill="rgb(142, 142, 142)" height="16" role="img" viewBox="0 0 24 24" width="16"><title>Like</title><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>

                                            <div className='flex gap-2 mt-2'>
                                                <div className='flex-1'>
                                                    <textarea id={`post-input-comment-id-${eachPost._id}`} className='w-full min-h-[50px] text-[14px] resize-none focus:outline-0' onClick={(e) => {handleCloseEmojiContainer(e.target)}}  onInput={(e) => {handleInputCommentPost(e.target)}} placeholder='Add a comment...'></textarea>
                                                </div>
                                                <button type="button" onClick={(e) => handleSubmitComment(eachPost._id, e, authenticatedUser.username)} style={{display: 'none'}} className='h-[14px] bg-transparent border-0 text-[#0099FF] text-[14px] font-medium'>Post</button>
                                                <div className='relative'>
                                                    <button onClick={handleShowEmojiPicker} type='button' className='bg-transparent border-0'>
                                                        <svg style={{pointerEvents: 'none'}} aria-label="Emoji" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="13" role="img" viewBox="0 0 24 24" width="13"><title>Emoji</title><path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path></svg>
                                                    </button>
                                                    <div style={{display: 'none'}} className='absolute top-[-450px] left-[-300px]'>
                                                        <EmojiPicker emojiStyle={EmojiStyle.NATIVE} onEmojiClick={(emojiData, event) => {
                                                            onEmojiClick(emojiData, event, `post-input-comment-id-${eachPost._id}`)
                                                        }} width={300} height={450}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </footer>
                                    </article>
                                }
                            })
                        }
                    </div>
                    {
                        fetchingMorePosts &&
                        <SkeletonHomePost />
                    }
                </>
            }
        </div>
    )
}

export default HomeAllPosts;