import { useState, useEffect, useRef, useCallback } from "react";
import ModalShowSpecificPost from "@/components/ModalShowSpecificPost";
import { useRouter } from "next/router";
import OptimizeImage from "@/helpers/optimizedImage";
import Image from "next/image";
import SkeletonProfilePost from "../SkeletonProfilePost";

const ProfilePost = ({username, authenticatedUser}: any) => {
    const { asPath } = useRouter();
    const router = useRouter();
    const [fetchingFirstAllPosts, setFetchingFirstAllPosts] = useState<boolean>(false);
    const [allPostsId, setAllPostsId] = useState<any>([]);
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(false);
    const [fetchingMorePosts, setFetchingMorePosts] = useState<boolean>(false);
    const [allPosts, setAllPosts] = useState<any>([]);
    const [currentIndexPost, setCurrentIndexPost] = useState<number>(0);
    const [showModalSpecificPost, setShowModalSpecificPost] = useState<boolean>(false);
    
    const showMore = async () => {
        setFetchingMorePosts(true);

        const response2 = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/profile/${username}/more`, {
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
            try {
                const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/profile/${username}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const { allPosts, length } = await response.json();

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
            } catch (error) {
                router.push('/home');
            }
        })()
    }, []);

    return (
        <>
            {
                allPosts.length > 0 &&
                <ModalShowSpecificPost 
                    parentURL={asPath}
                    authenticatedUser={authenticatedUser}   
                    showModalSpecificPost={showModalSpecificPost}
                    setShowModalSpecificPost={setShowModalSpecificPost}
                    currentIndexPost={currentIndexPost}
                    setCurrentIndexPost={setCurrentIndexPost}
                    allPosts={allPosts}
                />
            }
            
            <main className="w-full">
                <div className="w-full flex flex-wrap gap-[4px]">
                    {
                        fetchingFirstAllPosts ?
                        <>
                            <SkeletonProfilePost />
                        </>
                        :
                        <>
                            {
                                allPosts.length > 0 &&
                                    allPosts.map((eachPost: any, index: number) => {
                                        if(allPosts.length === index + 1) {
                                            return <div ref={lastPostElementRef} onClick={() => {
                                                setShowModalSpecificPost(true);
                                                setCurrentIndexPost(index);
                                            }} key={index} className="w-[calc(33.05%-4px)] aspect-square relative cursor-pointer">
                                                {eachPost.post.length > 1 && 
                                                    <div className="w-[20px] h-[20px] absolute right-[10px] top-[10px]">
                                                        <svg aria-label="Carousel" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
                                                    </div>
                                                }
                                                {eachPost.post[0].type === "video/mp4" ? 
                                                    <video crossOrigin="anonymous" src={eachPost.post[0].post} poster={eachPost.post[0].poster} className="w-full h-full object-cover"></video> 
                                                    :
                                                    <Image priority width={600} height={600} crossOrigin="anonymous" src={OptimizeImage(eachPost.post[0].post, ['w_600', 'h_600', 'c_fill'])} alt={eachPost.alt_text} className="w-full h-full object-cover"/>
                                                }
                                                <div className="w-full h-full bg-black absolute top-0 bg-opacity-0 opacity-0 hover:bg-opacity-30 hover:opacity-100 flex items-center">
                                                    <div className="flex gap-[5px] justify-center w-full items-center">
                                                        <Image width={21} height={17} src={"/likes.png"} alt="" className="w-[21px] h-[17px] mr-1"/>
                                                        <span className="text-[14px] font-bold text-white pb-1">{eachPost.likes.length}</span>
                
                                                        <Image width={17} height={17} src={"/comments.png"} alt="" className="ml-4 w-[17px] h-[17px] mr-1 mb-[0.5px]"/>
                                                        <span className="text-[14px] font-bold text-white pb-1">{eachPost.comments.length}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        }else {
                                            return <div onClick={() => {
                                                setShowModalSpecificPost(true);
                                                setCurrentIndexPost(index);
                                            }} key={index} className="w-[calc(33.05%-4px)] aspect-square relative cursor-pointer">
                                                {eachPost.post.length > 1 && 
                                                    <div className="w-[20px] h-[20px] absolute right-[10px] top-[10px]">
                                                        <svg aria-label="Carousel" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
                                                    </div>
                                                }
                                                {eachPost.post[0].type === "video/mp4" ? 
                                                    <video crossOrigin="anonymous" src={eachPost.post[0].post} poster={eachPost.post[0].poster} className="w-full h-full object-cover"></video> 
                                                    :
                                                    <Image priority width={600} height={600} crossOrigin="anonymous" src={OptimizeImage(eachPost.post[0].post, ['w_600', 'h_600', 'c_fill'])} alt={eachPost.alt_text} className="w-full h-full object-cover"/>
                                                }
                                                <div className="w-full h-full bg-black absolute top-0 bg-opacity-0 opacity-0 hover:bg-opacity-30 hover:opacity-100 flex items-center">
                                                    <div className="flex gap-[5px] justify-center w-full items-center">
                                                        <Image width={21} height={17} src={"/likes.png"} alt="" className="w-[21px] h-[17px] mr-1"/>
                                                        <span className="text-[14px] font-bold text-white pb-1">{eachPost.likes.length}</span>
                
                                                        <Image width={17} height={17} src={"/comments.png"} alt="" className="ml-4 w-[17px] h-[17px] mr-1 mb-[0.5px]"/>
                                                        <span className="text-[14px] font-bold text-white pb-1">{eachPost.comments.length}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    })
                            }
                            {
                                fetchingMorePosts &&
                                <>
                                    <SkeletonProfilePost />
                                </>
                            }
                        </>                        
                    }
                </div>
            </main>
        </>
    )
}

export default ProfilePost;