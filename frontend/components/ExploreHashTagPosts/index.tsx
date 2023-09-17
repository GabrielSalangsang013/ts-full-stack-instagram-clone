import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';

import ModalShowSpecificPost from '@/components/ModalShowSpecificPost';
import OptimizeImage from '@/helpers/optimizedImage';
import Image from 'next/image';
import SkeletonMorePostExploreHashTag from '@/components/SkeletonMorePostExploreHashTag';
import SkeletonExploreHashTagFirstPosts from '@/components/SkeletonExploreHashTagFirstPosts';

const ExploreHashTagPosts = ({authenticatedUser}: any) => {
    const { asPath, query } = useRouter();
    
    const [fetchingFirstAllPosts, setFetchingFirstAllPosts] = useState<boolean>(true);
    const [fetchingMorePosts, setFetchingMorePosts] = useState<boolean>(false);
    const [allPostsId, setAllPostsId] = useState<any>([]);
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(false);
    const [allPosts,setAllPosts] = useState<any>([]);
    const [showModalSpecificPost, setShowModalSpecificPost] = useState<boolean>(false);
    const [currentIndexPost, setCurrentIndexPost] = useState<number>(0);

    const showMore = async () => {
        setFetchingMorePosts(true);

        const response2 = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/explore/tags/hashtag`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hashtag: query.hashtag,
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
            const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/explore/tags/${query.hashtag}`, {
                method: 'GET',
                credentials: 'include'
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
        })();   
    }, []);
    
    return (
        <>
            {
                fetchingFirstAllPosts ?
                <SkeletonExploreHashTagFirstPosts />
                :
                <>
                    {
                        allPosts.length > 0 &&
                        <>
                            <ModalShowSpecificPost 
                                parentURL={asPath}
                                authenticatedUser={authenticatedUser}   
                                showModalSpecificPost={showModalSpecificPost}
                                setShowModalSpecificPost={setShowModalSpecificPost}
                                currentIndexPost={currentIndexPost}
                                setCurrentIndexPost={setCurrentIndexPost}
                                allPosts={allPosts}
                            />
                            
                            <div className='flex-1 p-4'>
                                <div className="mx-auto max-w-[963px] pt-3">
                                    <header className='h-[200px] flex gap-12'>
                                        <div className='w-[150px]'>
                                            <Image width={250} height={250} crossOrigin='anonymous' src={OptimizeImage(allPosts[0].post[0].post, ['w_250', 'h_250', 'c_fill'])} alt="" className='w-[150px] h-[150px] rounded-[50%] object-cover' />
                                        </div>
                                        <div className='flex-1'>
                                            <h1 className='text-[30px]'>#{query.hashtag}</h1>
                                            <h2 className='font-semibold'>{allPosts.length}</h2>
                                            <span>posts</span>
                                        </div>
                                    </header>
                                    <div className='mb-3 text-[14px] text-neutral-500 font-semibold'>Top posts</div>
                                    <main>
                                        <div className='max-w-[963px] w-full flex mt-[3px]'>
                                            <div className='w-full flex flex-wrap box-border gap-[3px]'>
                                                {
                                                    allPosts.length > 0 &&
                                                    allPosts.map((eachHashTagPost: any, index: number) => {
                                                        if(allPosts.length === index + 1) {
                                                            return <div ref={lastPostElementRef} key={index} className="w-[calc(33.3%-2px)]">
                                                                <div className="basis-[calc(33.3%)] aspect-square bg-neutral-200 relative">
                                                                    {   
                                                                        eachHashTagPost.post.length > 1 && 
                                                                        <div className="w-[20px] h-[20px] absolute right-[10px] top-[10px]">
                                                                            <svg aria-label="Carousel" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
                                                                        </div>
                                                                    }
                                                                    {
                                                                        eachHashTagPost.post[0].type === 'video/mp4' ? 
                                                                        <video crossOrigin='anonymous' src={eachHashTagPost.post[0].post} className="w-full h-full object-cover"/>
                                                                        :
                                                                        <Image priority width={600} height={600} crossOrigin="anonymous" src={OptimizeImage(eachHashTagPost.post[0].post, ['w_600', 'h_600', 'c_fill'])} alt='' className="w-full h-full object-cover"/>
                                                                    }
        
                                                                    <div onClick={() => {
                                                                            setShowModalSpecificPost(true);
                                                                            setCurrentIndexPost(index);
                                                                        }} className="cursor-pointer w-full h-full bg-black absolute top-0 bg-opacity-0 opacity-0 hover:bg-opacity-30 hover:opacity-100 flex items-center">
                                                                        <div className="flex gap-[5px] justify-center w-full items-center">
                                                                            <Image width={21} height={17} src={"/likes.png"} alt="" className="w-[21px] h-[17px] mr-1"/>
                                                                            <span className="text-[14px] font-bold text-white pb-1">{eachHashTagPost.likes.length}</span>
        
                                                                            <Image width={17} height={17} src={"/comments.png"} alt="" className="ml-4 w-[17px] h-[17px] mr-1 mb-[0.5px]"/>
                                                                            <span className="text-[14px] font-bold text-white pb-1">{eachHashTagPost.comments.length}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }else {
                                                            return <div key={index} className="w-[calc(33.3%-2px)]">
                                                                <div className="basis-[calc(33.3%)] aspect-square bg-neutral-200 relative">
                                                                    {   
                                                                        eachHashTagPost.post.length > 1 && 
                                                                        <div className="w-[20px] h-[20px] absolute right-[10px] top-[10px]">
                                                                            <svg aria-label="Carousel" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
                                                                        </div>
                                                                    }
                                                                    {
                                                                        eachHashTagPost.post[0].type === 'video/mp4' ? 
                                                                        <video crossOrigin='anonymous' src={eachHashTagPost.post[0].post} className="w-full h-full object-cover"/>
                                                                        :
                                                                        <Image priority width={600} height={600} crossOrigin="anonymous" src={OptimizeImage(eachHashTagPost.post[0].post, ['w_600', 'h_600', 'c_fill'])} alt='' className="w-full h-full object-cover"/>
                                                                    }
        
                                                                    <div onClick={() => {
                                                                            setShowModalSpecificPost(true);
                                                                            setCurrentIndexPost(index);
                                                                        }} className="cursor-pointer w-full h-full bg-black absolute top-0 bg-opacity-0 opacity-0 hover:bg-opacity-30 hover:opacity-100 flex items-center">
                                                                        <div className="flex gap-[5px] justify-center w-full items-center">
                                                                            <Image width={21} height={17} src={"/likes.png"} alt="" className="w-[21px] h-[17px] mr-1"/>
                                                                            <span className="text-[14px] font-bold text-white pb-1">{eachHashTagPost.likes.length}</span>
        
                                                                            <Image width={17} height={17} src={"/comments.png"} alt="" className="ml-4 w-[17px] h-[17px] mr-1 mb-[0.5px]"/>
                                                                            <span className="text-[14px] font-bold text-white pb-1">{eachHashTagPost.comments.length}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }
                                                    })
                                                }
        
                                                {
                                                    fetchingMorePosts &&
                                                    <SkeletonMorePostExploreHashTag />
                                                }
                                            </div>
                                        </div>
                                    </main>
                                </div>
                            </div>
                        </>
                    }
                </>
            }
        </>
    )
}

export default ExploreHashTagPosts;