'use client'

import { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import ModalUnfollowProfile from '../ModalUnfollowProfile';
import OptimizeImage from '@/helpers/optimizedImage';
import Image from 'next/image';
import SkeletonFollowingFollowersProfile from '../SkeletonFollowingFollowersProfile';

export default function ModalShowFollowing({showModalFollowing, setShowModalFollowing, username, isOwned, totalFollowing, setTotalFollowing}: any) {

    const [fetchingFollowing, setFetchingFollowing] = useState<boolean>(false);
    const [allFollowing, setAllFollowing] = useState<any>([]);
    const [showSearchIconFollowingUsers, setShowSearchIconFollowingUsers] = useState<boolean>(true);
    const [searchUserFollowingByUsername, setSearchUserFollowingByUsername] = useState<string>('');

    const [usernameToBeUnfollow, setUsernameToBeUnfollow] = useState<string>('');
    const [profilePictureToBeUnfollow, setProfilePictureToBeUnfollow] = useState<string>('');
    const [profile_id_to_be_unfollow, setProfile_id_to_be_unfollow] = useState<string>('');
    const [showModalUnfollowProfile, setShowModalUnfollowProfile] = useState<boolean>(false);

    function closeModal() {
        setShowModalFollowing(false)
    }

    useEffect(() => {
        setFetchingFollowing(true);

        const getAllFollowing = async () => {
            try {
                const settings: object = {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
        
                const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/following/${username}`, settings);
                const result = await response.json();
        
                if(result.status === 'ok') {
                    setAllFollowing(result.following.following);
                }else {
                    alert('failed');
                }

                setFetchingFollowing(false);
            }catch(error) {
                alert(error);
            }
        }

        
        if(showModalFollowing) {
            getAllFollowing();
        }

    }, [username, showModalFollowing]);

  return (
    <>
      <Transition appear show={showModalFollowing} as={Fragment}>
        <Dialog as="div" className="relative z-[802]" onClose={closeModal}>
            <ModalUnfollowProfile 
                usernameToBeUnfollow={usernameToBeUnfollow} 
                profilePictureToBeUnfollow={profilePictureToBeUnfollow}
                profile_id_to_be_unfollow={profile_id_to_be_unfollow}
                showModalUnfollowProfile={showModalUnfollowProfile}
                setShowModalUnfollowProfile={setShowModalUnfollowProfile}
                totalFollowing={totalFollowing}
                setTotalFollowing={setTotalFollowing}
            />
          
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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-100"
                enterFrom="opacity-0 scale-[1.05]"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-[1.05]"
              >
                <Dialog.Panel className="w-[400px] h-[400px] max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  <div className='w-full h-full bg-white flex flex-col'>
                    <div className='py-2 px-6 border-b border-b-neutral-200 flex justify-between'>
                        <div className=''>&nbsp;</div>
                        <div className='font-semibold'>Following</div>
                        <div onClick={closeModal} className='py-1 cursor-pointer'>
                            <svg aria-label="Close" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="18" role="img" viewBox="0 0 24 24" width="18"><title>Close</title><polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line></svg>
                        </div>
                    </div>
                    <div className='flex-1 flex flex-col'>
                        {
                            isOwned && 
                            <div className='px-4 mt-2'>
                                <div className='bg-neutral-200 w-full h-[35px] rounded-[7px] flex items-center px-4 gap-2'>
                                    {
                                        showSearchIconFollowingUsers &&
                                        <svg aria-label="Search" color="rgb(142, 142, 142)" fill="rgb(142, 142, 142)" height="16" role="img" viewBox="0 0 24 24" width="16"><title>Search</title><path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.511" x2="22" y1="16.511" y2="22"></line></svg>
                                    }
                                    <input 
                                        type="text" 
                                        placeholder='Search' 
                                        className='w-full bg-transparent focus:outline-0 text-[14px]'
                                        onBlur={() => {setShowSearchIconFollowingUsers(true)}} 
                                        onFocus={() => {setShowSearchIconFollowingUsers(false);}} 
                                        onChange={(e) => {setSearchUserFollowingByUsername(e.target.value);}} 
                                        value={searchUserFollowingByUsername}
                                    />
                                </div>
                            </div>
                        }
                        
                        <div className='flex-1 overflow-auto px-4 mt-4'>
                            {
                                fetchingFollowing ?
                                    <>
                                        <SkeletonFollowingFollowersProfile />
                                        <SkeletonFollowingFollowersProfile />
                                        <SkeletonFollowingFollowersProfile />
                                    </>
                                :
                                <>
                                    {
                                    allFollowing.length > 0 && 
                                        allFollowing.slice(0).reverse().map((eachFollowing: any, index: number) => (
                                            <div key={index} className="w-full flex justify-between mb-3">
                                                <div className='flex gap-3'>
                                                    <div className='w-[40px] h-[40px]'>
                                                        <a href={`/${eachFollowing.profile_id.user_id.username}`}>
                                                            <Image width={40} height={40} className='w-full h-full object-cover rounded-[50%] border border-neutral-300' crossOrigin='anonymous' src={OptimizeImage(eachFollowing.profile_id.profilePicture, ['w_64', 'h_64', 'c_fill'])} alt="testing"/>
                                                        </a>
                                                    </div>
                                                    <div className='flex flex-col'>
                                                        <a href={`/${eachFollowing.profile_id.user_id.username}`} className='leading-[12px] pt-1'>
                                                            <span className="text-[14px] font-medium">{eachFollowing.profile_id.user_id.username}</span>
                                                        </a>
                                                        <span className="text-[14px] text-neutral-500">{eachFollowing.profile_id.fullName}</span>
                                                    </div>
                                                </div>

                                                {
                                                    isOwned && <div className='flex items-center'>
                                                        <button type="button" onClick={() => {
                                                            setUsernameToBeUnfollow(eachFollowing.profile_id.user_id.username);
                                                            setProfilePictureToBeUnfollow(eachFollowing.profile_id.profilePicture);
                                                            setProfile_id_to_be_unfollow(eachFollowing.profile_id._id);
                                                            setShowModalUnfollowProfile(true);
                                                        }} className='text-[14px] hover:bg-neutral-300 bg-neutral-200 w-[100px] py-[5px] px-[16px] font-medium rounded-lg'>Following</button>
                                                    </div>
                                                }
                                            </div>
                                        ))
                                    }
                                </>
                            }   
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
