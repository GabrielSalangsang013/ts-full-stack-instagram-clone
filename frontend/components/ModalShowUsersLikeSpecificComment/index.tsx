'use client'

import { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SkeletonUsersWhoLikePostOrCommentProfile from '../SkeletonUsersWhoLikePostOrCommentProfile';

export default function ModalShowUsersLikeSpecificComment({
      showModalUsersLikeSpecificComment, 
      setShowModalUsersLikeSpecificComment, 
      commentId
    }: any) {

    const [fetchingUsersLikeComment, setFetchingUsersLikeComment] = useState<boolean>(false);
    const [allUsers, setAllUsers] = useState<any>([]);

    function closeModal() {
        setShowModalUsersLikeSpecificComment(false)
    }

    useEffect(() => {
        const getUsersWhoLikeThisComment = async () => {
            setFetchingUsersLikeComment(true);
            try {
                const settings: object = {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
        
                const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post/comment/${commentId}`, settings);
                const result = await response.json();
        
                if(result.status === 'ok') {
                    setAllUsers(result.allUsers);
                }else {
                    alert('failed');
                }
              setFetchingUsersLikeComment(false);
            }catch(error) {
                alert(error);
            }
        }

        if(showModalUsersLikeSpecificComment) {
            getUsersWhoLikeThisComment();
        }

    }, [commentId, showModalUsersLikeSpecificComment]);

  return (
    <>
      <Transition appear show={showModalUsersLikeSpecificComment} as={Fragment}>
        <Dialog as="div" className="relative z-[802]" onClose={closeModal}>
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
                        <div className='font-semibold'>Likes</div>
                        <div onClick={closeModal} className='py-1 cursor-pointer'>
                            <svg aria-label="Close" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="18" role="img" viewBox="0 0 24 24" width="18"><title>Close</title><polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line></svg>
                        </div>
                    </div>
                    <div className='flex-1 flex flex-col'>                        
                        <div className='flex-1 overflow-auto px-4 mt-4'>
                            {
                              fetchingUsersLikeComment ?
                                <>
                                  <SkeletonUsersWhoLikePostOrCommentProfile />
                                  <SkeletonUsersWhoLikePostOrCommentProfile />
                                  <SkeletonUsersWhoLikePostOrCommentProfile />
                                </>
                              :
                                allUsers.length > 0 &&
                                  <>
                                      {
                                          allUsers.slice(0).reverse().map((eachUser: any, index: number) => (
                                              <div key={index} className="w-full flex justify-between mb-3">
                                                  <div className='flex gap-3'>
                                                      <div className='w-[40px] h-[40px]'>
                                                          <Link href={`/${eachUser.user_id.username}`}>
                                                              <Image width={40} height={40} className='w-full h-full object-cover rounded-[50%] border border-neutral-300' crossOrigin='anonymous' src={eachUser.user_id.profile.profilePicture} alt="testing"/>
                                                          </Link>
                                                      </div>
                                                      <div className='flex flex-col'>
                                                          <Link href={`/${eachUser.user_id.username}`} className='leading-[12px] pt-1'>
                                                              <span className="text-[14px] font-medium">{eachUser.user_id.username}</span>
                                                          </Link>
                                                          <span className="text-[14px] text-neutral-500">{eachUser.user_id.profile.fullName}</span>
                                                      </div>
                                                  </div>
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
