import Image from 'next/image';

import { useState, useEffect, useRef, useCallback } from 'react';

import ModalShowSpecificPost from '@/components/ModalShowSpecificPost';
import { useRouter } from 'next/router';
import OptimizeImage from '@/helpers/optimizedImage';
import SkeletonExplorePost from '@/components/SkeletonExplorePost';

const ExploreAllPosts = ({authenticatedUser}: any) => {
    
    const { asPath } = useRouter();
    const router = useRouter();

    const [fetchingFirstPosts, setFetchingFirstPosts] = useState<boolean>(false);
    const [allPostsId, setAllPostsId] = useState<any>([]);
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(false);

    const [fetchingMorePosts, setFetchingMorePosts] = useState<boolean>(false);
    
    const [showModalSpecificPost, setShowModalSpecificPost] = useState<boolean>(false);
    const [currentIndexPost, setCurrentIndexPost] = useState<number>(0);
    const [nestedAllPosts, setNestedallPosts] = useState<any>([[]]);
    const [allPosts, setAllPosts] = useState<any>([]);

    function getIndexInAllPosts(_id: string) {
        let index = 0;

        for (let i = 0; i < allPosts.length; i++) {
            if(allPosts[i]._id === _id) {
                index = i;
                i = allPosts.length;
            }
        }

        return index;
    }

    const showMore = async () => {
        setFetchingMorePosts(true);

        const response2 = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/more/explore`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                allPostsId: allPostsId
            })
        });

        const { nestedAllPosts, allPosts, length } = await response2.json();

        let seenAllPosts: string[] = [];

        for(let i = 0; i < allPosts.length; i++) {
            seenAllPosts.push(allPosts[i]._id);
        }

        if(length <= 0) {
            setHasMorePosts(false);
        }

        setNestedallPosts((previous: any) => [...previous, ...nestedAllPosts]);
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
        setFetchingFirstPosts(true);
        (async() => {
            const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/explore`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(response.status !== 200) {
                router.push('/login');
            }

            const { nestedAllPosts, allPosts, length } = await response.json();
            
            let seenAllPosts = [];

            for(let i = 0; i < allPosts.length; i++) {
                seenAllPosts.push(allPosts[i]._id);
            }

            if(length > 0) {
                setHasMorePosts(true);
            }

            setNestedallPosts(nestedAllPosts);
            setAllPosts(allPosts);
            setAllPostsId(seenAllPosts);
            setFetchingFirstPosts(false);
        })();
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
            
            <div className='flex-1 p-4'>
                <div className="mx-auto max-w-[963px] pt-8">
                    {
                        fetchingFirstPosts ?
                        <>
                            <SkeletonExplorePost />
                            <SkeletonExplorePost />
                        </>
                        :
                        allPosts.length > 0 && 
                            nestedAllPosts.map((eachNestedPost: any, index: number) => {
                                if(index % 2 !== 0) {
                                    return <div ref={allPosts.length ===  getIndexInAllPosts(eachNestedPost[0]._id) + 1 ? lastPostElementRef : null} key={index} className='max-w-[963px] w-full flex mt-[3px]'>
                                                <div className='flex-1 flex flex-wrap w-full mr-[3px]'>
                                                    <div className="w-[calc(100%)] h-full">
                                                        <div className="bg-neutral-200 h-full relative">
                                                            {   
                                                                eachNestedPost[0].post.length > 1 && 
                                                                <div className="w-[20px] h-[20px] absolute right-[10px] top-[10px]">
                                                                    <svg aria-label="Carousel" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
                                                                </div>
                                                            }
                                                            {
                                                                eachNestedPost[0].post[0].type === 'video/mp4' ?
                                                                <video crossOrigin='anonymous' src={eachNestedPost[0].post[0].post} className="w-full h-full object-cover"/>
                                                                :
                                                                <Image priority width={700} height={1080} crossOrigin="anonymous" src={OptimizeImage(eachNestedPost[0].post[0].post, ['w_700', 'h_1080', 'c_fill'])} alt={eachNestedPost[0].alt_text} className="w-full h-full object-cover"/>
                                                            }
                                                            
                                                            <div onClick={() => {
                                                                setShowModalSpecificPost(true);
                                                                setCurrentIndexPost(getIndexInAllPosts(eachNestedPost[0]._id));
                                                            }} className="cursor-pointer w-full h-full bg-black absolute top-0 bg-opacity-0 opacity-0 hover:bg-opacity-30 hover:opacity-100 flex items-center">
                                                                <div className="flex gap-[5px] justify-center w-full items-center">
                                                                    <Image width={21} height={17} src={"/likes.png"} alt="" className="w-[21px] h-[17px] mr-1"/>
                                                                    <span className="text-[14px] font-bold text-white pb-1">{eachNestedPost[0].likes.length}</span>

                                                                    <Image width={17} height={17} src={"/comments.png"} alt="" className="ml-4 w-[17px] h-[17px] mr-1 mb-[0.5px]"/>
                                                                    <span className="text-[14px] font-bold text-white pb-1">{eachNestedPost[0].comments.length}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='w-[calc(66.6%)] flex flex-wrap box-border gap-[3px]'>
                                                    {
                                                        eachNestedPost.map((eachExplorePost: any, index: number) => {
                                                            if (index !== 0) {
                                                                return <div ref={allPosts.length ===  getIndexInAllPosts(eachExplorePost._id) + 1 ? lastPostElementRef : null} key={index} className="w-[calc(50%-1.5px)]">
                                                                    <div className="basis-[calc(50%)] aspect-square bg-neutral-200 relative">
                                                                        {   
                                                                            eachExplorePost.post.length > 1 && 
                                                                            <div className="w-[20px] h-[20px] absolute right-[10px] top-[10px]">
                                                                                <svg aria-label="Carousel" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
                                                                            </div>
                                                                        }
                                                                        {
                                                                            eachExplorePost.post[0].type === 'video/mp4' ? 
                                                                            <video crossOrigin='anonymous' src={eachExplorePost.post[0].post} className="w-full h-full object-cover"/>
                                                                            :
                                                                            <Image width={600} height={600} crossOrigin="anonymous" src={OptimizeImage(eachExplorePost.post[0].post, ['w_600', 'h_600', 'c_fill'])} alt='' className="w-full h-full object-cover"/>
                                                                        }

                                                                        <div onClick={() => {
                                                                                setShowModalSpecificPost(true);
                                                                                setCurrentIndexPost(getIndexInAllPosts(eachExplorePost._id));
                                                                            }} className="cursor-pointer w-full h-full bg-black absolute top-0 bg-opacity-0 opacity-0 hover:bg-opacity-30 hover:opacity-100 flex items-center">
                                                                            <div className="flex gap-[5px] justify-center w-full items-center">
                                                                                <Image width={21} height={17} src={"/likes.png"} alt="" className="w-[21px] h-[17px] mr-1"/>
                                                                                <span className="text-[14px] font-bold text-white pb-1">{eachExplorePost.likes.length}</span>
                
                                                                                <Image width={17} height={17} src={"/comments.png"} alt="" className="ml-4 w-[17px] h-[17px] mr-1 mb-[0.5px]"/>
                                                                                <span className="text-[14px] font-bold text-white pb-1">{eachExplorePost.comments.length}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }
                                                        })
                                                    }
                                                </div>
                                            </div>
                                }else {
                                    return <div key={index} className='max-w-[963px] w-full flex mt-[3px]'>
                                                <div className='w-[calc(66.9%)] flex flex-wrap box-border gap-[3px]'>
                                                    {
                                                        eachNestedPost.map((eachExplorePost: any, index: number) => {
                                                            if(index !== 0) {
                                                                return <div ref={allPosts.length ===  getIndexInAllPosts(eachExplorePost._id) + 1 ? lastPostElementRef : null} key={index} className="w-[calc(50%-3px)]">
                                                                    <div className="basis-[calc(50%)] aspect-square bg-neutral-200 relative">
                                                                        {   
                                                                            eachExplorePost.post.length > 1 && 
                                                                            <div className="w-[20px] h-[20px] absolute right-[10px] top-[10px]">
                                                                                <svg aria-label="Carousel" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
                                                                            </div>
                                                                        }
                                                                        {
                                                                            eachExplorePost.post[0].type === 'video/mp4' ? 
                                                                            <video crossOrigin='anonymous' src={eachExplorePost.post[0].post} className="w-full h-full object-cover"/>
                                                                            :
                                                                            <Image width={600} height={600} crossOrigin="anonymous" src={OptimizeImage(eachExplorePost.post[0].post, ['w_600', 'h_600', 'c_fill'])} alt='' className="w-full h-full object-cover"/>
                                                                        }        
                                                                        
                                                                        <div onClick={() => {
                                                                                setShowModalSpecificPost(true);
                                                                                setCurrentIndexPost(getIndexInAllPosts(eachExplorePost._id));
                                                                            }} className="cursor-pointer w-full h-full bg-black absolute top-0 bg-opacity-0 opacity-0 hover:bg-opacity-30 hover:opacity-100 flex items-center">
                                                                            <div className="flex gap-[5px] justify-center w-full items-center">
                                                                                <Image width={21} height={17} src={"/likes.png"} alt="" className="w-[21px] h-[17px] mr-1"/>
                                                                                <span className="text-[14px] font-bold text-white pb-1">{eachExplorePost.likes.length}</span>

                                                                                <Image width={17} height={17} src={"/comments.png"} alt="" className="ml-4 w-[17px] h-[17px] mr-1 mb-[0.5px]"/>
                                                                                <span className="text-[14px] font-bold text-white pb-1">{eachExplorePost.comments.length}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }
                                                        })
                                                    }
                                                </div>

                                                <div className='flex-1 flex flex-wrap w-full'>
                                                    <div ref={allPosts.length ===  getIndexInAllPosts(eachNestedPost[0]._id) + 1 ? lastPostElementRef : null} className="w-[calc(100%)] h-full">
                                                        <div className="bg-neutral-200 h-full relative">
                                                            {   
                                                                eachNestedPost[0].post.length > 1 && 
                                                                <div className="w-[20px] h-[20px] absolute right-[10px] top-[10px]">
                                                                    <svg aria-label="Carousel" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
                                                                </div>
                                                            }
                                                            {
                                                                eachNestedPost[0].post[0].type === "video/mp4" ?
                                                                <video crossOrigin='anonymous' src={eachNestedPost[0].post[0].post} className="w-full h-full object-cover"/>
                                                                :
                                                                <Image width={700} height={1080} crossOrigin="anonymous" src={OptimizeImage(eachNestedPost[0].post[0].post, ['w_700', 'h_1080', 'c_fill'])} alt={eachNestedPost[0].alt_text} className="w-full h-full object-cover"/>
                                                            }
                                                            
                                                            <div onClick={() => {
                                                                    setShowModalSpecificPost(true);
                                                                    setCurrentIndexPost(getIndexInAllPosts(eachNestedPost[0]._id));
                                                                }} className="cursor-pointer w-full h-full bg-black absolute top-0 bg-opacity-0 opacity-0 hover:bg-opacity-30 hover:opacity-100 flex items-center">
                                                                <div className="flex gap-[5px] justify-center w-full items-center">
                                                                    <Image width={21} height={17} src={"/likes.png"} alt="" className="w-[21px] h-[17px] mr-1"/>
                                                                    <span className="text-[14px] font-bold text-white pb-1">{eachNestedPost[0].likes.length}</span>

                                                                    <Image width={17} height={17} src={"/comments.png"} alt="" className="ml-4 w-[17px] h-[17px] mr-1 mb-[0.5px]"/>
                                                                    <span className="text-[14px] font-bold text-white pb-1">{eachNestedPost[0].comments.length}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                }
                            })
                    }
                    {
                        fetchingMorePosts &&
                        <SkeletonExplorePost />
                    }
                </div>
            </div>
        </>
    )
}

export default ExploreAllPosts;