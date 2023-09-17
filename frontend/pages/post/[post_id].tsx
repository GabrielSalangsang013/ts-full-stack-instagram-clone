import Head from "next/head";
import SideNav from "@/components/SideNav";
import Layout from "@/components/Layout";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import handleTimeDifference from "@/helpers/timeDifference";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import ModalPostCommentMoreOptions from "@/components/ModalPostCommentMoreOptions";
import ModalShowUsersLikeSpecificComment from "@/components/ModalShowUsersLikeSpecificComment";
import ModalShowUsersLikePost from "@/components/ModalShowUsersLikePost";
import replaceMentionsAndHashtagsWithLinks from "@/helpers/replaceMentionsAndHashtagsWithLinks";
import ModalPostMoreOptions from "@/components/ModalPostMoreOptions";
import { useRouter } from "next/router";
import Image from "next/image";
import PrivateRoutes from "@/components/PrivateRoutes";

const EmojiPicker = dynamic(
    () => {
      return import('emoji-picker-react');
    },
    { ssr: false }
);

type userPostType = {
    _id: string,
    post: [],
    caption: string,
    alt_text: string,
    user_id: {
        username: string
    },
    profile_id: {
        profilePicture: string,
        posts: []
    },
    createdAt: string,
    likes: []
}

const Post = ({authenticatedUser}: any) => {
    const router = useRouter();
    const { query } = router; 

    const [loading, setLoading] = useState<boolean>(true);
    const [sideNavActive, setSideNavActive] = useState<string>('');
    const [userPost, setUserPost] = useState<userPostType>({
        _id: '', 
        post: [], 
        caption: '', 
        alt_text: '', 
        user_id: {
            username: ''
        }, 
        profile_id: {
            profilePicture: '',
            posts: []
        }, 
        createdAt: '',
        likes: []
    });

    const [showModalMoreOptions, setShowModalMoreOptions] = useState(false);
    const [showModalPostCommentMoreOptions, setShowModalPostCommentMoreOptions] = useState(false);
    const [showModalUsersLikeSpecificComment, setShowModalUsersLikeSpecificComment] = useState(false);
    const [showModalUsersLikePost, setShowModalUsersLikePost] = useState<boolean>(false);
    const [modalCommentId, setModalCommentId] = useState<string>('');
    const [commentId, setCommentId] = useState<string>('');
    
    const [newComment, setNewComment] = useState<string>('');
    const [isAuthenticatedUserLikeThisPost, setIsAuthenticatedUserLikeThisPost] = useState<boolean>(false);
    const [totalLikes, setTotalLikes] = useState<number>(0);
    const [modalCommentUsername, setModalCommentUsername] = useState<string>('');

    const emojiContainerRef = useRef<any>();
    const newCommentInputRef = useRef<any>(); // WE GONNA USE USE REF NOT USE STATE BECAUSE WE ARE SSR.
    const commentContainerRef = useRef<any>();
    const likeButtonRef = useRef<any>();
    const postCommentButtonRef = useRef<any>();

    const [allComments, setAllComments] = useState<any>(null);

    const onEmojiClick = (emojiData: EmojiClickData, event: any) => {
        setNewComment(newComment + emojiData.emoji);
        newCommentInputRef.current.style.height = '5px';
        newCommentInputRef.current.style.height = (newCommentInputRef.current.scrollHeight + 'px');
        handleInputCommentPost();
    }

    const handleShowEmojiPicker = (e: any) => {
        emojiContainerRef.current.classList.toggle('hidden');
    }

    const handleInputCommentPost = async () => {
        if(newCommentInputRef.current.value === '') {
            postCommentButtonRef.current.classList.add('hidden');
        }else {
            postCommentButtonRef.current.classList.remove('hidden');
        }

        newCommentInputRef.current.style.height = "5px";
        newCommentInputRef.current.style.height = (newCommentInputRef.current.scrollHeight) + "px";
    }

    const handleSubmitNewComment = async (e: any) => {
        if(newComment !== '') {
            const newCommentHTML = `
                <div class="flex mb-2">
                    <div class="py-[14px] pl-[16px] flex items-start">
                        <a href='/${authenticatedUser.username}'>
                            <img crossOrigin="anonymous" src='${authenticatedUser.profile.profilePicture}' alt="User Profile Picture" width='32' height='32' class="w-[32px] h-[32px] object-cover mr-2 border border-neutral-300 rounded-[50%]"/>
                        </a>
                    </div>
                    <div class="flex-1 py-[10px]">
                        <a href='/${authenticatedUser.username}'><span class="text-[14px] font-medium mr-1">${authenticatedUser.username}</span> </a>
                        <span class="text-neutral-500 text-[14px]">0s</span> 
                        <div class="text-[14px]">${newComment}</div>
                    </div>
                    <div class="py-[14px] pr-[16px] flex">
                        <button type="button">
                            <svg aria-label="Like" color="rgb(38, 38, 38)" fill="rgb(38, 38, 38)" height="12" role="img" viewBox="0 0 24 24" width="12"><title>Like</title><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path></svg>
                        </button>
                    </div>
                </div>
            `;

            commentContainerRef.current.insertAdjacentHTML("beforeend", newCommentHTML);
            
            try {
                const settings: object = {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        post_id: userPost._id,
                        comment: newComment
                    })
                }
    
                setNewComment('');
                if(!emojiContainerRef.current.classList.contains('hidden')) {
                    emojiContainerRef.current.classList.add('hidden');
                }
    
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
    }

    const handleLikePost = async () => {
        let button_type_function = likeButtonRef.current.getAttribute('data-type-function');

        if(button_type_function === 'like') {
            try {
                const settings: object = {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        post_id: userPost._id
                    })
                }
    
                setIsAuthenticatedUserLikeThisPost(true);
                setTotalLikes(totalLikes + 1);

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
            try {
                const settings: object = {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        post_id: userPost._id
                    })
                }
                
                setIsAuthenticatedUserLikeThisPost(false);
                setTotalLikes(totalLikes - 1);
                
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
    }

    const handleLikeComment = async(comment_id: string, element: any) => {
        let button_type_function = element.getAttribute('data-type-function');
        let comment_total_likes_container: HTMLDivElement|null = document.querySelector(`[data-type-total-likes-container='${comment_id}']`);
        

        if(button_type_function === 'like') {
            element.setAttribute('data-type-function', 'unlike');
            element.innerHTML = `
                <svg class='pointer-events-none' color="rgb(255, 48, 64)" fill="rgb(255, 48, 64)" height="16" role="img" viewBox="0 0 48 48" width="16">
                    <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                </svg>
            `;

            if(comment_total_likes_container !== null) {
                let totalLikes = comment_total_likes_container.getAttribute('data-type-total-likes-comment');
                
                if(totalLikes !== null) {
                    totalLikes = String(Number(totalLikes) + 1);
                    comment_total_likes_container.innerText =  totalLikes + ' ' +(() => {
                        if(totalLikes === '1') {
                            return 'like'
                        }else {
                            return 'likes'
                        }
                    })();

                    comment_total_likes_container.setAttribute('data-type-total-likes-comment', totalLikes);
                }
            }

            try {
                const settings: object = {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        comment_id: comment_id
                    })
                }
    
                const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/like/comment`, settings);
                const result = await response.json();
    
                if(result.status === 'ok') {
                    alert('success');
                }else {
                    alert('failed');
                }
            }catch(error) {
                console.log(error);
            }
        }else {
            element.setAttribute('data-type-function', 'like');
            element.innerHTML = `
                <svg class='pointer-events-none' color="rgb(142, 142, 142)" fill="rgb(142, 142, 142)" height="16" role="img" viewBox="0 0 24 24" width="16">
                    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                </svg>
            `
            if(comment_total_likes_container !== null) {
                let totalLikes = comment_total_likes_container.getAttribute('data-type-total-likes-comment');
                
                if(totalLikes !== null) {
                    totalLikes = String(Number(totalLikes) - 1);

                    if(totalLikes === '0') {
                        comment_total_likes_container.innerText =  '';
                    }else {
                        comment_total_likes_container.innerText =  totalLikes + (() => {
                            if(totalLikes === '1') {
                                return 'like'
                            }else {
                                return 'likes'
                            }
                        })();
                    }

                    comment_total_likes_container.setAttribute('data-type-total-likes-comment', totalLikes);
                }
            }

            try {
                const settings: object = {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        comment_id: comment_id
                    })
                }
    
                const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/unlike/comment`, settings);
                const result = await response.json();
    
                if(result.status === 'ok') {
                    alert('success');
                }else {
                    alert('failed');
                }
            }catch(error) {
                console.log(error);
            }
        }

        
    }


    useEffect(() => {
        (async() => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post/${query.post_id}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.status !== 200) {
                    router.push('/home');
                } else {
                    const { userPost } = await response.json();

                    if (userPost === undefined) {
                        router.push('/home');
                    }

                    setSideNavActive('');
                    setUserPost(userPost);
                    setLoading(false);

                    setIsAuthenticatedUserLikeThisPost(userPost.isAuthenticatedUserLikeThisPost);
                    setTotalLikes(userPost.likes.length);


                    const getAllComments = async() => {
                        try {
                            const settings: object = {
                                method: 'GET',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }

                            const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/comments/${query.post_id}`, settings);
                            const result = await response.json();

                            if(result.status === 'ok') {
                                setAllComments(result.comments.comments);
                            }else {
                                alert('failed');
                            }
                        }catch(error) {
                            alert(error);
                        }
                    }

                    getAllComments();
                }
            } catch (error) {
                return {
                    notFound: true, // Return a 404 page if an error occurs
                };
            }
        })();
    }, []);

    return (
        <>
            <Head>
                <title>Instagram</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/instagram_icon.ico" />
            </Head>

            {
                !loading &&
                <>
                    <ModalPostMoreOptions 
                        showModalMoreOptions={showModalMoreOptions}
                        setShowModalMoreOptions={setShowModalMoreOptions} 
                        postId={userPost._id}
                        post={userPost}
                        authenticatedUser={authenticatedUser}
                    />

                    <ModalPostCommentMoreOptions
                        showModalPostCommentMoreOptions={showModalPostCommentMoreOptions}
                        setShowModalPostCommentMoreOptions={setShowModalPostCommentMoreOptions} 
                        modalCommentId={modalCommentId} 
                        postId={userPost._id}
                        post={userPost}
                        authenticatedUser={authenticatedUser}
                        modalCommentUsername={modalCommentUsername}
                    />

                    <ModalShowUsersLikeSpecificComment 
                        showModalUsersLikeSpecificComment={showModalUsersLikeSpecificComment}
                        setShowModalUsersLikeSpecificComment={setShowModalUsersLikeSpecificComment}
                        commentId={commentId}
                    />

                    <ModalShowUsersLikePost 
                        showModalUsersLikePost={showModalUsersLikePost}
                        setShowModalUsersLikePost={setShowModalUsersLikePost} 
                        postId={userPost._id}
                    />

                    <Layout>
                        <SideNav authenticatedUser={authenticatedUser} sideNavActive={sideNavActive}/>
                        <div className="flex-1 p-4">
                            <div className="mx-auto max-w-[955px] mt-8 border border-neutral-200 flex">
                                <div className="max-w-[600px] max-h-[600px] w-full">
                                    <Splide options={ { rewind: false, arrows: userPost.post.length > 1, drag: false } } aria-label="React Splide Example">
                                        {userPost.post.map((eachPost: any, index: number) => (
                                            <SplideSlide key={index}>
                                                {eachPost.type === 'video/mp4' ? 
                                                    <div className="w-full h-full flex items-center justify-center bg-black min-h-[600px]">
                                                        <video poster={eachPost.poster} crossOrigin="anonymous" src={eachPost.post} className="w-full object-contain max-h-[600px]" controls/>
                                                    </div>
                                                    : 
                                                    <div className="w-full h-full flex items-center justify-center bg-black min-h-[600px]">
                                                        <Image priority crossOrigin="anonymous" src={eachPost.post} width={5000} height={5000} alt={userPost.alt_text} className="w-full object-contain max-h-[600px]"/>
                                                    </div>
                                                }
                                            </SplideSlide>
                                        ))}
                                    </Splide>

                                </div>
                                <div className="flex-1 max-h-[600px] flex flex-col">
                                    {/* POST INFORMATION */}
                                    <div className="h-[61px] flex border-b border-b-neutral-200">
                                        <div className="py-[14px] pl-[16px] pr-[4px] w-[calc(100%-48px)] flex items-center">
                                            <Link href={`/${userPost.user_id.username}`}><Image width={32} height={32} crossOrigin="anonymous" src={userPost.profile_id.profilePicture} alt="User Profile Picture" className="w-[32px] h-[32px] object-cover mr-4 border border-neutral-300 rounded-[50%]"/></Link>
                                            <Link href={`/${userPost.user_id.username}`}><span className="text-[14px] font-medium">{userPost.user_id.username}</span></Link>
                                        </div>
                                        <button type="button" onClick={() => {setShowModalMoreOptions(true);}} className="flex-1 flex items-center justify-center">
                                            <svg aria-label="More options" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle></svg>
                                        </button>
                                    </div>

                                    <div ref={commentContainerRef} className="flex-1 overflow-auto">
                                        {/* CAPTION */}
                                        <div className="flex mb-2">
                                            <div className="py-[14px] pl-[16px] flex items-start">
                                                <Link href={`/${userPost.user_id.username}`}><Image width={32} height={32} crossOrigin="anonymous" src={userPost.profile_id.profilePicture} alt="User Profile Picture" className="w-[32px] h-[32px] object-cover mr-2 border border-neutral-300 rounded-[50%]"/></Link>
                                            </div>
                                            <div className="flex-1 flex py-[14px]">
                                                <span>
                                                    <Link href={`/${userPost.user_id.username}`}><span className="text-[14px] font-medium mr-2">{userPost.user_id.username}</span></Link>
                                                    <span className="text-neutral-500 text-[14px]">• {handleTimeDifference(userPost.createdAt)}</span>
                                                    <div className="text-[14px] whitespace-pre-line pr-4" dangerouslySetInnerHTML={replaceMentionsAndHashtagsWithLinks(userPost.caption)}></div>
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            {
                                                allComments !== null &&
                                                <>
                                                    {
                                                        allComments.map((eachComment: any, index: number) => (
                                                            <div key={index} data-post-comment-id={eachComment.user_id.username === authenticatedUser.username && eachComment._id} className="flex mb-2">
                                                                <div className="w-[56px] h-[65px] py-[14px] pl-[16px] flex items-start">
                                                                    <Link className="w-[56px] h-[65px]" href={`/${eachComment.user_id.username}`}><Image width={32} height={32} crossOrigin="anonymous" src={eachComment.user_id.profile.profilePicture} alt="User Profile Picture" className="w-[32px] h-[32px] object-cover mr-2 border border-neutral-300 rounded-[50%]"/></Link>
                                                                </div>
                                                                <div className="flex-1 py-[10px]">
                                                                    <Link href={`/${eachComment.user_id.username}`}><span className="text-[14px] font-medium mr-1">{eachComment.user_id.username}</span> </Link>
                                                                    <span className="text-neutral-500 text-[14px]">{handleTimeDifference(eachComment.createdAt)}</span> 
                                                                    <button type="button" className="ml-2" onClick={() => {
                                                                        setShowModalPostCommentMoreOptions(true); 
                                                                        setModalCommentId(eachComment._id); 
                                                                        setModalCommentUsername(eachComment.user_id.username);
                                                                    }}>
                                                                        <svg className="inline" aria-label="Comment Options" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Comment Options</title><circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle></svg>
                                                                    </button>
                                                                    <div className="text-[14px] leading-[20px]">{eachComment.comment}</div>
                                                                    <button onClick={() => {
                                                                        setShowModalUsersLikeSpecificComment(true);
                                                                        setCommentId(eachComment._id);
                                                                    }} type="button" data-type-total-likes-comment={eachComment.likes.length} data-type-total-likes-container={eachComment._id} className="text-[12px] text-neutral-500 font-medium mt-2">
                                                                        {
                                                                            eachComment.likes.length > 0 ?
                                                                            <>
                                                                                {
                                                                                    eachComment.likes.length === 1 ?
                                                                                    eachComment.likes.length + ' ' + 'like'
                                                                                    :
                                                                                    eachComment.likes.length + ' ' + 'likes'
                                                                                }
                                                                            </>
                                                                            :
                                                                            <>
                                                                            </>
                                                                        } 
                                                                    </button>
                                                                    
                                                                </div>
                                                                <div className="py-[14px] pr-[16px] flex">
                                                                    <button id={eachComment._id} onClick={(e) => {
                                                                        handleLikeComment(eachComment._id, e.target);
                                                                    }} type="button" data-type-function={eachComment.isAuthenticatedUserLikeThisComment ? 'unlike' : 'like'} className="flex pt-2">
                                                                        {
                                                                            eachComment.isAuthenticatedUserLikeThisComment ? 
                                                                            <svg className='pointer-events-none' color="rgb(255, 48, 64)" fill="rgb(255, 48, 64)" height="16" role="img" viewBox="0 0 48 48" width="16">
                                                                                <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                                                                            </svg>
                                                                            :
                                                                            <svg className='pointer-events-none' color="rgb(142, 142, 142)" fill="rgb(142, 142, 142)" height="16" role="img" viewBox="0 0 24 24" width="16">
                                                                                <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                                                                            </svg>
                                                                        }
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </>
                                            }
                                        </div>
                                    </div>

                                    <div className="h-[auto] px-[8px] py-[6px] border-t border-t-neutral-200 ">
                                        <div className="flex justify-between">
                                            <div className="flex">
                                                <button ref={likeButtonRef} onClick={handleLikePost} type="button" className="p-2" data-type-function={isAuthenticatedUserLikeThisPost ? 'unlike' : 'like'}>
                                                    {
                                                        isAuthenticatedUserLikeThisPost === true ? 
                                                        <svg aria-label="Unlike" color="rgb(255, 48, 64)" fill="rgb(255, 48, 64)" height="24" role="img" viewBox="0 0 48 48" width="24">
                                                            <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                                                        </svg>
                                                        :
                                                        <svg aria-label="Like" color="rgb(38, 38, 38)" fill="rgb(38, 38, 38)" height="24" role="img" viewBox="0 0 24 24" width="24">
                                                            <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                                                        </svg>
                                                    }
                                                </button>
                                                <button type="button" className="p-2">
                                                    <svg aria-label="Comment" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Comment</title><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>
                                                </button>
                                                <button type="button" className="p-2">
                                                    <svg aria-label="Share Post" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Share Post</title><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                                                </button>
                                            </div>
                                            <div className="flex">
                                                <button type="button" className="p-2">
                                                    <svg aria-label="Save" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Save</title><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => {setShowModalUsersLikePost(true);}}>
                                            {
                                                totalLikes === 1 ?
                                                <div className="font-medium text-[14px] px-[8px]">
                                                    {totalLikes} like
                                                </div> :
                                                totalLikes > 1 &&
                                                <div className="font-medium text-[14px] px-[8px]">
                                                    {totalLikes} likes
                                                </div>
                                            }
                                            <div className="text-[10px] font-light px-[8px] tracking-[0.2px]">
                                                {handleTimeDifference(userPost.createdAt).toUpperCase()} AGO
                                            </div>
                                        </button>
                                    </div>
                                    <div className="h-[auto] mt-2 px-[8px] py-[12px] flex items-center">
                                        <div className="w-[32px] h-[32px] mx-[8px]">
                                            <Image width={32} height={32} crossOrigin="anonymous" src={userPost.profile_id.profilePicture} alt="" className="w-[32px] h-[32px] object-cover rounded-[50%]"/>
                                        </div>
                                        <div className="flex-1 mx-[8px]">
                                            <textarea ref={newCommentInputRef} placeholder="Add a comment..." className="focus:outline-0 border-0 resize-none h-[18px] text-[14px] w-full overflow-hidden max-h-[100px]" onClick={() => {
                                                if(!emojiContainerRef.current.classList.contains('hidden')) {
                                                    emojiContainerRef.current.classList.add('hidden');
                                                }
                                            }} onChange={(e) => {setNewComment(e.target.value); handleInputCommentPost()}} value={newComment}></textarea>
                                        </div>
                                        <div className="mx-[8px] h-full flex items-center">
                                            <button ref={postCommentButtonRef} data-type-total-likes={userPost.likes.length} type="button" onClick={handleSubmitNewComment} className="hidden bg-transparent border-0 text-[#0099FF] text-[14px] font-medium">
                                                Post    
                                            </button>
                                        </div>
                                        <div className="mx-[8px]">
                                            <div className='relative flex items-center'>
                                                <button type='button' onClick={handleShowEmojiPicker} className='bg-transparent border-0'>
                                                    <svg aria-label="Emoji" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Emoji</title><path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path></svg>
                                                </button>
                                                <div ref={emojiContainerRef} className='hidden absolute top-[-450px] left-[-300px]'>
                                                    <EmojiPicker emojiStyle={EmojiStyle.NATIVE} onEmojiClick={(emojiData, event) => {
                                                        onEmojiClick(emojiData, event)
                                                    }} width={300} height={450}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                            </div>

                            {
                                userPost.profile_id.posts.length > 0 &&
                                <div className="mx-auto max-w-[955px] mt-12 border-t border-t-neutral-200 flex flex-col py-12">
                                    <header>
                                        <span className="text-[14px] text-neutral-500 font-medium">
                                            More posts from <Link href={`/${userPost.user_id.username}`} className="text-black hover:opacity-50">{userPost.user_id.username}</Link>
                                        </span>
                                    </header>
                                    <main className="mt-4">
                                        <div className='w-full flex flex-wrap box-border gap-[3px]'>
                                            {
                                                userPost.profile_id.posts.length > 0 &&
                                                userPost.profile_id.posts.map((eachPost: any, index: number) => (
                                                    <div key={index} className="w-[calc(33.3%-2px)]">
                                                        <div className="basis-[calc(33.3%)] aspect-square bg-neutral-200 relative">
                                                            {   
                                                                eachPost.post.length > 1 && 
                                                                <div className="w-[20px] h-[20px] absolute right-[10px] top-[10px]">
                                                                    <svg aria-label="Carousel" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
                                                                </div>
                                                            }
                                                            {
                                                                eachPost.post[0].type === 'video/mp4' ? 
                                                                <video poster={eachPost.poster} crossOrigin='anonymous' src={eachPost.post[0].post} className="w-full h-full object-cover"/>
                                                                :
                                                                <Image priority width={5000} height={5000} crossOrigin="anonymous" src={eachPost.post[0].post} alt='' className="w-full h-full object-cover"/>
                                                            }

                                                            <Link href={`/post/${eachPost._id}`} className="cursor-pointer w-full h-full bg-black absolute top-0 bg-opacity-0 opacity-0 hover:bg-opacity-30 hover:opacity-100 flex items-center">
                                                                <div className="flex gap-[5px] justify-center w-full items-center">
                                                                    <Image src={"/likes.png"} alt="" width={21} height={17} className="w-[21px] h-[17px] mr-1"/>
                                                                    <span className="text-[14px] font-bold text-white pb-1">{eachPost.likes.length}</span>

                                                                    <Image src={"/comments.png"} alt="" width={17} height={17} className="ml-4 w-[17px] h-[17px] mr-1 mb-[0.5px]"/>
                                                                    <span className="text-[14px] font-bold text-white pb-1">{eachPost.comments.length}</span>
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </main>
                                </div>
                            }

                            
                        </div>
                    </Layout>

                </>
            }
        </>
    )
}

export default PrivateRoutes(Post);

export async function getServerSideProps(context: any) {
    const { res } = context;

    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

    return {
        props: {}
    };
}