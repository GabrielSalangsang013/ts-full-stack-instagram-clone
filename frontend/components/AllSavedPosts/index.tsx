import ModalShowSpecificPost from "@/components/ModalShowSpecificPost";
import { useState, useEffect } from "react";
import router, { useRouter } from "next/router";
import Image from "next/image";
import SkeletonAllSavedPosts from "@/components/SkeletonAllSavedPosts";
import Link from "next/link";
import OptimizeImage from "@/helpers/optimizedImage";

const AllSavedPosts = ({authenticatedUser}: any) => {
    const { asPath } = useRouter();
    const { query } = router;

    const [fetchingFirstPosts, setFetchingFirstPosts] = useState<boolean>(false);
    const [savePost, setSavePost] = useState<[]>([]);
    const [currentIndexPost, setCurrentIndexPost] = useState<number>(0);
    const [showModalSpecificPost, setShowModalSpecificPost] = useState<boolean>(false);

    useEffect(() => {
        setFetchingFirstPosts(true);
        (async() => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/profile/${query.profile}/saved/all-posts`, {
                    method: 'GET',
                    credentials: 'include'
                });


                if (response.status !== 200) {
                    router.push('/home');
                } else {
                    const { savePost } = await response.json();
                    setSavePost(savePost);
                    setFetchingFirstPosts(false);
                }
            } catch (error) {
                router.push('/home');
            }
        })();
    }, []);
    

    return (
        <>
            {
                fetchingFirstPosts === true ?
                <SkeletonAllSavedPosts />
                :
                <>
                    <div className="mb-2">
                        <Link href={`/${authenticatedUser.username}/saved`}>
                            <button type="button" className="flex items-center gap-1">
                                <svg aria-label="Back" className="-rotate-90" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="18" role="img" viewBox="0 0 24 24" width="18">
                                    <path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z"></path>
                                </svg>
                                <h1 className="text-[14px] font-medium text-neutral-500">Saved</h1>
                            </button>
                        </Link>
                    </div>

                    <div className="w-full">
                        <div className="mb-1">
                            <h2 className="text-xl">All Posts</h2>
                            {
                                savePost.length > 0 &&
                                <>
                                    <ModalShowSpecificPost 
                                        parentURL={asPath}
                                        authenticatedUser={authenticatedUser}   
                                        showModalSpecificPost={showModalSpecificPost}
                                        setShowModalSpecificPost={setShowModalSpecificPost}
                                        currentIndexPost={currentIndexPost}
                                        setCurrentIndexPost={setCurrentIndexPost}
                                        allPosts={savePost}
                                    />

                                    <div className="w-full flex flex-wrap gap-[4px]">
                                        {
                                            savePost.length > 0 &&
                                            savePost.map((eachSavePost: any, index: number) => (
                                                <div onClick={() => {
                                                    setShowModalSpecificPost(true);
                                                    setCurrentIndexPost(index);
                                                }} key={index} className="w-[calc(33.05%-4px)] aspect-square relative cursor-pointer bg-neutral-200">
                                                    {eachSavePost.post.length > 1 && 
                                                        <div className="w-[20px] h-[20px] absolute right-[10px] top-[10px]">
                                                            <svg aria-label="Carousel" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="22" role="img" viewBox="0 0 48 48" width="22"><title>Carousel</title><path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path></svg>
                                                        </div>
                                                    }
                                                    {eachSavePost.post[0].type === "video/mp4" ? 
                                                        <video crossOrigin="anonymous" src={eachSavePost.post[0].post} poster={eachSavePost.post[0].poster}></video> :
                                                        <Image priority width={5000} height={5000} crossOrigin="anonymous" src={OptimizeImage(eachSavePost.post[0].post, ['w_600', 'h_600', 'c_fill'])} alt={eachSavePost.alt_text} className="w-full h-full object-cover"/>
                                                    }
                                                    <div className="w-full h-full bg-black absolute top-0 bg-opacity-0 opacity-0 hover:bg-opacity-30 hover:opacity-100 flex items-center">
                                                        <div className="flex gap-[5px] justify-center w-full items-center">
                                                            <Image width={21} height={17} src={"/likes.png"} alt="" className="w-[21px] h-[17px] mr-1"/>
                                                            <span className="text-[14px] font-bold text-white pb-1">{eachSavePost.likes.length}</span>

                                                            <Image width={17} height={17} src={"/comments.png"} alt="" className="ml-4 w-[17px] h-[17px] mr-1 mb-[0.5px]"/>
                                                            <span className="text-[14px] font-bold text-white pb-1">{eachSavePost.comments.length}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </>
            }
        </>
    )
}

export default AllSavedPosts;