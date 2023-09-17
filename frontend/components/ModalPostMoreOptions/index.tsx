import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import ModalUpdatePost from '../ModalUpdatePost'
import { useState } from 'react';

export default function ModalPostMoreOptions({
  showModalMoreOptions, 
  setShowModalMoreOptions, 
  postId, 
  post, 
  authenticatedUser
}: any) {

  const [showModalUpdatePost, setShowModalUpdatePost] = useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<any>(null);

  function closeModal() {
    setShowModalMoreOptions(false)
  }

  const handleDeletePost = async () => {
    closeModal();

    try {
        const settings: object = {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_id: postId
            })
        }

        const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post`, settings);
        const result = await response.json();

        if(result.status === 'ok') {
            window.location.href = `/${authenticatedUser.username}`;
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
        currentPost &&
        <ModalUpdatePost 
          post={currentPost}
          showModalUpdatePost={showModalUpdatePost}
          setShowModalUpdatePost={setShowModalUpdatePost}
          authenticatedUser={authenticatedUser}
        />
      }

      <Transition appear show={showModalMoreOptions} as={Fragment}>
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
                <Dialog.Panel className="w-[400px] max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  {
                    // * IF I'M THE OWNER OF THIS UPLOADED POST (POSTED IMAGES OR VIDEOS) I HAVE AUTHORITY TO DELETE THIS POST
                    // * CHECK THIS POST AND WHO IS THE USER ID AND CHECK IF THE USER ID IS SAME TO THE AUTHENTICATED USER ID.
                    post.user_id.username === authenticatedUser.username && 
                    <>
                      <button onClick={handleDeletePost} type="button" className='bg-transparent border-0 w-full h-[48px] text-[14px] font-bold text-red-500'>
                        Delete
                      </button>
                      <button onClick={() => {closeModal(); setShowModalUpdatePost(true); setCurrentPost(post);}} type="button" className='bg-transparent border-t border-t-neutral-200 w-full h-[48px] text-[14px]'>
                        Edit
                      </button>
                    </>
                  }
                  
                  <button onClick={closeModal} type="button" className='bg-transparent border-t border-t-neutral-200 w-full h-[48px] text-[14px]'>
                      Cancel
                  </button>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
