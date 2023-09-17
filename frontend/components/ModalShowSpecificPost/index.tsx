'use client'

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import Image from 'next/image';

import '../../pages/globals.css';

import handleTimeDifference from "@/helpers/timeDifference";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import ModalPostCommentMoreOptions from "@/components/ModalPostCommentMoreOptions";
import ModalPostMoreOptions from "@/components/ModalPostMoreOptions";
import replaceMentionsAndHashtagsWithLinks from '@/helpers/replaceMentionsAndHashtagsWithLinks';
import ModalShowUsersLikeSpecificComment from '@/components/ModalShowUsersLikeSpecificComment';
import ModalShowUsersLikePost from '@/components/ModalShowUsersLikePost';
import OptimizeImage from '@/helpers/optimizedImage';
import SkeletonCommentSpecificPost from '@/components/SkeletonCommentSpecificPost';

const EmojiPicker = dynamic(
  () => {
    return import('emoji-picker-react');
  },
  { ssr: false }
);

const ModalShowSpecificPost = ({
        parentURL,
        authenticatedUser,
        showModalSpecificPost,
        setShowModalSpecificPost,
        currentIndexPost,
        setCurrentIndexPost,
        allPosts,
    }: any) => {

    const [fetchingMoreComments, setFetchingMoreComments] = useState<boolean>(false);
    const [showModalMoreOptions, setShowModalMoreOptions] = useState(false);
    const [showModalPostCommentMoreOptions, setShowModalPostCommentMoreOptions] = useState(false);
    const [showModalUsersLikeSpecificComment, setShowModalUsersLikeSpecificComment] = useState(false);
    const [showModalUsersLikePost, setShowModalUsersLikePost] = useState<boolean>(false);
    const [modalCommentId, setModalCommentId] = useState<string>('');
    const [modalCommentUsername, setModalCommentUsername] = useState<string>('');
    const [commentId, setCommentId] = useState<string>('');
    const [bestWidth, setBestWidth] = useState<number>(0);
    const [currentAutoWidth, setCurrentAutoWidth] = useState<boolean>(true);

    const [showNextPostButton, setShowNextPostButton] = useState(false);
    const [showPreviousPostButton, setShowPreviousPostButton] = useState(false);
    
    const [newComment, setNewComment] = useState<string>('');
    const [isAuthenticatedUserLikeThisPost, setIsAuthenticatedUserLikeThisPost] = useState<boolean>(false);
    const [isAuthenticatedUserSaveThisPost, setIsAuthenticatedUserSaveThisPost] = useState<boolean>(false);
    const [totalLikes, setTotalLikes] = useState<number>(0);

    const emojiContainerRef = useRef<any>();
    const newCommentInputRef = useRef<any>(); // WE GONNA USE REF NOT USE STATE BECAUSE WE ARE SSR.
    const commentContainerRef = useRef<any>();
    const likeButtonRef = useRef<any>();
    const saveButtonRef = useRef<any>();
    const postCommentButtonRef = useRef<any>();

    const [allComments, setAllComments] = useState<any>([]);

    function closeModal() {
        window.history.replaceState(null, "Instagram", `${parentURL}`);
        setShowModalSpecificPost(false);
        setAllComments([]);
    }

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
                    <div class="w-[56px] h-[65px] py-[14px] pl-[16px] pr-[4px] mr-2 flex items-start">
                        <a href='/${authenticatedUser.username}'>
                            <img crossOrigin="anonymous" src='${OptimizeImage(authenticatedUser.profile.profilePicture, ['w_64', 'h_64', 'c_fill'])}' alt="User Profile Picture" width='32' height='32' class="w-[32px] h-[32px] object-cover mr-4 border border-neutral-300 rounded-[50%]"/>
                        </a>
                    </div>
                    <div class="flex-1 py-[0px]">
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
                        post_id: allPosts[currentIndexPost]._id,
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
                        post_id: allPosts[currentIndexPost]._id
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
                        post_id: allPosts[currentIndexPost]._id
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

    const handleShowNextPost = () => {
        setCurrentIndexPost(currentIndexPost + 1);
    }

    const handleShowPreviousPost = () => {
        setCurrentIndexPost(currentIndexPost - 1);
    }

    const handleLikeComment = async (comment_id: string, element: any) => {
        let button_type_function = element.getAttribute('data-type-function');
        let comment_total_likes_container: HTMLDivElement|null = document.querySelector(`[data-type-total-likes-container='${comment_id}']`);

        if(button_type_function === 'like') {
            element.setAttribute('data-type-function', 'unlike');
            element.innerHTML = `
                <svg class='pointer-events-none' color="rgb(255, 48, 64)" fill="rgb(255, 48, 64)" height="12" role="img" viewBox="0 0 48 48" width="12">
                    <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                </svg>
            `

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
                <svg class="pointer-events-none" color="rgb(38, 38, 38)" fill="rgb(38, 38, 38)" height="12" role="img" viewBox="0 0 24 24" width="12">
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

    const handleSavePost = async () => {
        let button_type_function = saveButtonRef.current.getAttribute('data-type-function');

        if(button_type_function === 'save') {
            try {
                const settings: object = {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        post_id: allPosts[currentIndexPost]._id
                    })
                }
    
                setIsAuthenticatedUserSaveThisPost(true);

                const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post/save`, settings);
                const result = await response.json();

                if(result.status === 'ok') {
                    alert('success');
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
                        post_id: allPosts[currentIndexPost]._id
                    })
                }
    
                setIsAuthenticatedUserSaveThisPost(false);

                const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post/unsave`, settings);
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

    useEffect(() => {
        try {
            setFetchingMoreComments(true);
            setAllComments([]);
            setIsAuthenticatedUserLikeThisPost(allPosts[currentIndexPost].isAuthenticatedUserLikeThisPost);
            setIsAuthenticatedUserSaveThisPost(allPosts[currentIndexPost].isAuthenticatedUserSaveThisPost);
            setTotalLikes(allPosts[currentIndexPost].likes.length);
            setFetchingMoreComments(true);

            const getAllComments = async() => {
                try {
                    const settings: object = {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }

                    const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/comments/${allPosts[currentIndexPost]._id}`, settings);
                    const result = await response.json();

                    if(result.status === 'ok') {
                        setAllComments(result.comments.comments);
                    }else {
                        alert('failed');
                    }

                    setFetchingMoreComments(false);
                }catch(error) {
                    alert(error);
                }
            }

            if(showModalSpecificPost) {
                getAllComments();
            }

            if(allPosts[currentIndexPost + 1] !== undefined) {
                setShowNextPostButton(true);
            }else {
                setShowNextPostButton(false);
            }

            if(allPosts[currentIndexPost - 1] !== undefined) {
                setShowPreviousPostButton(true);
            }else {
                setShowPreviousPostButton(false);
            }

            if (showModalSpecificPost) {
                window.history.replaceState(null, "Instagram", `/`);
                window.history.replaceState(null, "Instagram", `post/${allPosts[currentIndexPost]._id}`);
            }

            setBestWidth(700);

            if(currentAutoWidth === false) {
                setCurrentAutoWidth(true);
            }
        }catch (error) {
            console.log(error);
        }
    }, [allPosts, currentAutoWidth, showModalSpecificPost, currentIndexPost]);
     
    return (
        <>
            <ModalPostMoreOptions 
                showModalMoreOptions={showModalMoreOptions}
                setShowModalMoreOptions={setShowModalMoreOptions} 
                postId={allPosts[currentIndexPost]._id}
                post={allPosts[currentIndexPost]}
                authenticatedUser={authenticatedUser}
            />

            <ModalPostCommentMoreOptions
                showModalPostCommentMoreOptions={showModalPostCommentMoreOptions}
                setShowModalPostCommentMoreOptions={setShowModalPostCommentMoreOptions} 
                modalCommentId={modalCommentId} 
                postId={allPosts[currentIndexPost]._id} 
                post={allPosts[currentIndexPost]}
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
                postId={allPosts[currentIndexPost]._id}
            />

            <Transition appear show={showModalSpecificPost} as={Fragment}>
                <Dialog as="div" className="relative z-[801]" onClose={(e) => {}} onClick={(e: any) => {
                    if(e.target.tagName !== 'BUTTON') {
                        closeModal();
                    }
                }}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-100"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                    <div className="fixed inset-0 bg-black bg-opacity-60" />
                    </Transition.Child>


                    <div className="fixed inset-0 overflow-y-auto">
                        {
                            showPreviousPostButton && 
                            <button type="button" onClick={handleShowPreviousPost} className='absolute top-[48%] left-0 text-black ml-3 p-[8px] rounded-[50%] bg-neutral-200 hover:opacity-50 transition-[0.2s]'>
                                <svg aria-label="Go Back" className='-rotate-90 pointer-events-none' color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="16" role="img" viewBox="0 0 24 24" width="16"><title>Go Back</title><path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z"></path></svg>   
                            </button>
                        }
                        {
                            showNextPostButton && 
                            <button type="button" onClick={handleShowNextPost} className='absolute top-[48%] right-0 bg-white text-black mr-3 p-[8px] rounded-[50%] bg-neutral-200 hover:opacity-50 transition-[0.2s]'>
                                <svg aria-label="Next" className='rotate-90 pointer-events-none' color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="16" role="img" viewBox="0 0 24 24" width="16"><title>Next</title><path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z"></path></svg>
                            </button>
                        }

                        <div className="flex h-full items-center justify-center p-4 text-center w-auto">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-100"
                                enterFrom="opacity-0 scale-[1.05]"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-100"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-[1.05]"
                            >
                                <Dialog.Panel className="transform overflow-hidden text-left transition-all">
                                    {/* MAIN CONTAINER OF THE SPECIFIC POST */}
                                    <div className='flex max-w-[1350px]'>
                                        <div className={`flex-1 w-[700px] w-[${bestWidth}px] max-w-[1350px-700px] bg-white max-w-[1350px-${bestWidth}px] overflow-hidden`}>
                                            <Splide options={{ rewind: false, arrows: allPosts[currentIndexPost].post.length > 1, drag: false, autoWidth: currentAutoWidth, cover: true, perPage: 1 }} aria-label="React Splide Example">
                                                {allPosts[currentIndexPost].post.map((eachPost: any, index: number) => (
                                                    <SplideSlide key={index}>
                                                        {eachPost.type === 'video/mp4' ? 
                                                            <div className="h-full w-full flex items-center justify-center bg-black">
                                                                <video poster={eachPost.poster} crossOrigin='anonymous' src={eachPost.post} className="max-w-[calc(1350px-500px)] max-h-[875px] object-cover aspect-auto" onLoadedData={(e) => {
                                                                    if(e.target instanceof HTMLVideoElement) {
                                                                        if(bestWidth < e.target.videoWidth) {
                                                                            // ! PLEASE TURN THIS ON AGAIN
                                                                            // setBestWidth(e.target.videoWidth);
                                                                            // setCurrentAutoWidth(false);
                                                                        }
                                                                    }
                                                                }} controls/>
                                                            </div>
                                                            : 
                                                            <div className='h-full w-full flex items-center justify-center relative'>
                                                                <Image priority quality={100} height={875} width={bestWidth} onLoad={(e) => {
                                                                    if (e.target instanceof HTMLImageElement) {
                                                                        if (bestWidth < e.target.width) {
                                                                          setBestWidth(e.target.width);
                                                                          if (currentAutoWidth === false) {
                                                                            setCurrentAutoWidth(true);
                                                                          }
                                                                        }
                                                                    }
                                                                }} crossOrigin="anonymous" src={eachPost.post} alt={allPosts[currentIndexPost].alt_text} className={`max-w-[calc(1350px-500px)] max-h-[875px] h-full w-full object-contain aspect-auto`} />
                                                            </div>
                                                        }
                                                    </SplideSlide>
                                                ))}
                                            </Splide>
                                        </div>                                    
                                        <div className="w-[500px] h-auto max-h-[875px] bg-white flex flex-col">
                                            <div className="h-[61px] flex border-b border-b-neutral-200">
                                                <div className="py-[14px] pl-[16px] pr-[4px] w-[calc(100%-48px)] flex items-center">
                                                    <Link href={`/${allPosts[currentIndexPost].user_id.username}`}><Image width={64} height={64} crossOrigin="anonymous" src={OptimizeImage(allPosts[currentIndexPost].profile_id.profilePicture, ['w_64', 'h_64', 'c_fill'])} alt="User Profile Picture" className="w-[32px] h-[32px] object-cover mr-4 border border-neutral-300 rounded-[50%]"/></Link>
                                                    <Link href={`/${allPosts[currentIndexPost].user_id.username}`}><span className="text-[14px] font-medium">{allPosts[currentIndexPost].user_id.username}</span></Link>
                                                </div>
                                                <button type="button" onClick={() => {setShowModalMoreOptions(true);}} className="flex-1 flex items-center justify-center">
                                                    <svg aria-label="More options" className='pointer-events-none' color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle></svg>
                                                </button>
                                            </div>

                                            <div ref={commentContainerRef} className="flex-1 overflow-auto relative">
                                                <div className="flex mb-2">
                                                    <div className="py-[14px] pl-[16px] pr-[4px] flex items-start">
                                                        <Link href={`/${allPosts[currentIndexPost].user_id.username}`}><Image width={64} height={64} crossOrigin="anonymous" src={OptimizeImage(allPosts[currentIndexPost].profile_id.profilePicture, ['w_64', 'h_64', 'c_fill'])} alt="User Profile Picture" className="w-[32px] h-[32px] object-cover mr-3 border border-neutral-300 rounded-[50%]"/></Link>
                                                    </div>
                                                    <div className="flex-1 flex py-[14px]">
                                                        <span className='pr-8'>
                                                            <Link href={`/${allPosts[currentIndexPost].user_id.username}`}><span className="text-[14px] font-medium mr-2">{allPosts[currentIndexPost].user_id.username}</span></Link>
                                                            <span className="text-[14px] whitespace-pre-line" dangerouslySetInnerHTML={replaceMentionsAndHashtagsWithLinks(allPosts[currentIndexPost].caption)}></span>
                                                            <div><span className="text-neutral-500 text-[12px]">{handleTimeDifference(allPosts[currentIndexPost].createdAt)}</span></div>
                                                        </span>
                                                    </div>
                                                </div>


                                                <div>
                                                    {
                                                        fetchingMoreComments ? 
                                                        <>
                                                            <SkeletonCommentSpecificPost />
                                                            <SkeletonCommentSpecificPost />
                                                        </>
                                                        :
                                                            allComments.length !== 0 ?
                                                            <>
                                                                {
                                                                    allComments.map((eachComment: any, index: number) => (
                                                                        <div key={index} data-post-comment-id={eachComment.user_id.username === authenticatedUser.username && eachComment._id} className="flex mb-2">
                                                                            <div className="w-[56px] h-[65px] py-[14px] pl-[16px] pr-[4px] mr-2 flex items-start">
                                                                                <Link className="w-[56px] h-[65px]" href={`/${eachComment.user_id.username}`}>
                                                                                    <Image width={64} height={64} crossOrigin="anonymous" src={OptimizeImage(eachComment.user_id.profile.profilePicture, ['w_64', 'h_64', 'c_fill'])} alt="User Profile Picture"
                                                                                    className="w-[32px] h-[32px] object-cover mr-4 border border-neutral-300 rounded-[50%]"/>
                                                                                </Link>
                                                                            </div>
                                                                            <div className="flex-1 py-[10px]">
                                                                                <Link href={`/${eachComment.user_id.username}`}><span className="text-[14px] font-medium mr-1">{eachComment.user_id.username}</span> </Link>
                                                                                <span className="text-neutral-500 text-[14px]">{handleTimeDifference(eachComment.createdAt)}</span> 
                                                                                <button type="button" className='ml-2' onClick={() => {
                                                                                    setShowModalPostCommentMoreOptions(true); 
                                                                                    setModalCommentId(eachComment._id);
                                                                                    setModalCommentUsername(eachComment.user_id.username);
                                                                                }}>
                                                                                    <svg className="inline" aria-label="Comment Options" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Comment Options</title><circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle></svg>
                                                                                </button>
                                                                                <div className="text-[14px] pr-4">{eachComment.comment}</div>
                                                                                <button onClick={() => {
                                                                                    setShowModalUsersLikeSpecificComment(true);
                                                                                    setCommentId(eachComment._id);
                                                                                }} type="button" data-type-total-likes-comment={eachComment.likes.length} data-type-total-likes-container={eachComment._id} className="hidden text-[12px] text-neutral-500 font-medium mt-2">
                                                                                    {
                                                                                        eachComment.likes.length > 0 ?
                                                                                        <>
                                                                                            {
                                                                                                eachComment.likes.length === 1 ? eachComment.likes.length + ' ' + 'like'
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
                                                                                        <svg className='pointer-events-none' color="rgb(255, 48, 64)" fill="rgb(255, 48, 64)" height="12" role="img" viewBox="0 0 48 48" width="12">
                                                                                            <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                                                                                        </svg>
                                                                                        :
                                                                                        <svg className='pointer-events-none' color="rgb(38, 38, 38)" fill="rgb(38, 38, 38)" height="12" role="img" viewBox="0 0 24 24" width="12">
                                                                                            <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                                                                                        </svg>
                                                                                    }
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </>
                                                            :
                                                            <>
                                                                <div className='w-full flex items-center justify-center flex-col mt-[150px]'>
                                                                    <h1 className='text-[24px] font-bold'>No comments yet.</h1>
                                                                    <p className='text-[14px]'>Start a conversation.</p>
                                                                </div>
                                                            </>
                                                    }
                                                </div>
                                            </div>

                                            <div className="h-[auto] px-[8px] py-[6px] pb-[12px] border-y border-y-neutral-100 ">
                                                <div className="flex justify-between">
                                                    <div className="flex">
                                                        <button ref={likeButtonRef} onClick={handleLikePost} type="button" className="p-2" data-type-function={isAuthenticatedUserLikeThisPost ? 'unlike' : 'like'}>
                                                            {
                                                                isAuthenticatedUserLikeThisPost === true ? 
                                                                <svg color="rgb(255, 48, 64)" fill="rgb(255, 48, 64)" height="24" role="img" viewBox="0 0 48 48" width="24">
                                                                    <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                                                                </svg>
                                                                :
                                                                <svg color="rgb(38, 38, 38)" fill="rgb(38, 38, 38)" height="24" role="img" viewBox="0 0 24 24" width="24">
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
                                                        <button ref={saveButtonRef} onClick={handleSavePost} type="button" className="p-2" data-type-function={isAuthenticatedUserSaveThisPost ? 'unsave' : 'save'}>
                                                            {
                                                                isAuthenticatedUserSaveThisPost === true ?
                                                                <svg color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24">
                                                                    <path d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"></path>
                                                                </svg>
                                                                :
                                                                <svg color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24">
                                                                    <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                                                                </svg>
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => {setShowModalUsersLikePost(true);}}>
                                                    {
                                                        totalLikes === 1 ?
                                                        <div className="font-medium text-[14px] pl-[2px] pr-[8px]">
                                                            {totalLikes} like
                                                        </div> :
                                                        totalLikes > 1 &&
                                                        <div className="font-medium text-[14px] px-[8px]">
                                                            {totalLikes} likes
                                                        </div>
                                                    }
                                                    <div className="text-[10px] font-light px-[8px] tracking-[0.2px]">
                                                        {handleTimeDifference(allPosts[currentIndexPost].createdAt).toUpperCase()} AGO
                                                    </div>
                                                </button>
                                            </div>
                                            <div className="h-[auto] mt-2 px-[8px] py-[12px] flex items-center">
                                                <div className="w-[32px] h-[32px] mx-[8px]">
                                                    <Image width={64} height={64} crossOrigin="anonymous" src={OptimizeImage(authenticatedUser.profile.profilePicture, ['w_64', 'h_64', 'c_fill'])} alt="" className="w-[32px] h-[32px] object-cover rounded-[50%]"/>
                                                </div>
                                                <div className="flex-1 mx-[8px]">
                                                    <textarea ref={newCommentInputRef} placeholder="Add a comment..." className="focus:outline-0 border-0 resize-none h-[18px] text-[14px] w-full overflow-hidden max-h-[100px]" onClick={() => {
                                                        if(!emojiContainerRef.current.classList.contains('hidden')) {
                                                            emojiContainerRef.current.classList.add('hidden');
                                                        }
                                                    }} onChange={(e) => {setNewComment(e.target.value); handleInputCommentPost()}} value={newComment}></textarea>
                                                </div>
                                                <div className="mx-[8px] h-full flex items-center">
                                                    <button ref={postCommentButtonRef} data-type-total-likes={totalLikes} type="button" onClick={handleSubmitNewComment} className="hidden bg-transparent border-0 text-[#0099FF] text-[14px] font-medium">
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
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default ModalShowSpecificPost;