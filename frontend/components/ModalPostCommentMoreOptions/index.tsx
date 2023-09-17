import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function ModalPostCommentMoreOptions({
  showModalPostCommentMoreOptions, 
  setShowModalPostCommentMoreOptions, 
  modalCommentId, 
  postId, 
  post, 
  authenticatedUser, 
  modalCommentUsername
}: any) {

  function closeModal() {
    setShowModalPostCommentMoreOptions(false)
  }

  const handleDeletePostComment = async () => {
    document.querySelector(`[data-post-comment-id="${modalCommentId}"]`)?.classList.add('hidden');
    closeModal();

    try {
        const settings: object = {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_id: postId,
                comment_id: modalCommentId
            })
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

  return (
    <>
      <Transition appear show={showModalPostCommentMoreOptions} as={Fragment}>
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
                    // * IF I'M THE OWNER OF THE UPLOADED POST, I CAN DELETE WHO ANYONE COMMENTED ON MY UPLODADED POST.
                    // * OR IF I'M THE OWNER OF THE COMMENT IN THE POST, I CAN DELETE MY COMMENT IN THE POST.
                    (post.user_id.username === authenticatedUser.username) || 
                    (modalCommentUsername === authenticatedUser.username) ? 
                    <button onClick={handleDeletePostComment} type="button" className='bg-transparent border-0 w-full h-[48px] text-[14px] font-bold text-red-500'>
                      Delete
                    </button>
                  : <></>}
                  
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
