import OptimizeImage from "@/helpers/optimizedImage";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import SkeletonHomeSuggestProfile from "../SkeletonHomeSuggestProfile";

const HomeSuggestFollowProfiles = () => {
    const [fetchingSugestProfiles, setFetchingSugestProfiles] = useState<boolean>(false);
    const [suggestFollowProfiles, setSuggestFollowProfiles] = useState<[]>([]);

    useEffect(() => {
        setFetchingSugestProfiles(true);

        (async() => {
            const response3 = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/suggest/follow/profiles`, {
                method: 'GET',
                credentials: 'include'
            });
    
            const { suggestFollowProfiles } = await response3.json();
            setSuggestFollowProfiles(suggestFollowProfiles);
            setFetchingSugestProfiles(false);
        })();
    }, []);
    
    const handleFollow = async (profile_id: string, index: number) => {
        document.querySelector(`[data-type-button-follow-id='${index}']`)?.remove();

        try {
            const settings: object = {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    profile_id: profile_id
                })
            }

            const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/follow`, settings);
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

    return (
        <>
            {
                fetchingSugestProfiles ?
                <>
                    <SkeletonHomeSuggestProfile />
                </>
                :
                <>
                    {
                        suggestFollowProfiles.length > 0 &&
                        <div className='flex-1 h-[200px] sticky top-[50px]'>
                            <div className='flex justify-between mb-3'>
                                <span className='text-neutral-500 text-[14px] font-semibold'>Suggested for you</span>
                                <Link href="/explore/people" className='mt-[-4px]'><span className='text-[12px] font-medium'>See All</span></Link>
                            </div>
        
                            {   
                                suggestFollowProfiles.map((eachSuggest: any, index: number) => (
                                    <div key={index} className='flex h-auto gap-2'>
                                        <div className='w-[54px] h-[54px] flex items-center justify-center'>
                                            <Link href={`/${eachSuggest.username}`}>
                                                <Image width={44} height={44} crossOrigin='anonymous' src={OptimizeImage(eachSuggest.profile.profilePicture, ['w_64', 'h_64', 'c_fill'])} alt="" className='w-[44px] h-[44px] object-cover rounded-[50%]'/>
                                            </Link>
                                        </div>
                                        <div className='flex-1 flex flex-col pt-2'>
                                            <Link href={`/${eachSuggest.username}`} className='mt-[-6px]'><span className='text-[14px] font-medium'>{eachSuggest.username}</span></Link>
                                            <span className='text-[12px] text-neutral-500'>Suggested for you</span>
                                        </div>
                                        <div className='flex items-center'>
                                            <button data-type-button-follow-id={index} onClick={(e) => {handleFollow(eachSuggest.profile._id, index);}} type="button" className='text-[12px] text-sky-500 font-medium'>Follow</button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    }
                </>
            }
        </>
    )
}

export default HomeSuggestFollowProfiles;