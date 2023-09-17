import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Image from 'next/image';

export default function ModalRemoveFollower({usernameToBeRemoveFollower, profilePictureToBeRemoveFollower, userIdFollower, showModalRemoveFollower, setShowModalRemoveFollower, totalFollowers, setTotalFollowers}: any) {

  function closeModal() {
    setShowModalRemoveFollower(false);
  }

  const handleRemoveFollower = async () => {
    try {
        const settings: object = {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userIdFollower
            })
        }

        const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/follower/remove`, settings);
        const result = await response.json();

        if(result.status === 'ok') {
            setTotalFollowers(totalFollowers - 1);
            setShowModalRemoveFollower(false);
        }else {
            alert('failed');
        }
    }catch(error) {
        alert(error);
    }
  }

  return (
    <>
      <Transition appear show={showModalRemoveFollower} as={Fragment}>
        <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
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
                  <div className='p-[32px] flex items-center justify-center flex-col'>
                        <div className='w-[90px] h-[90px] mb-[32px]'>
                            <Image width={90} height={90} className='w-full h-full object-cover rounded-[50%] border border-neutral-300' crossOrigin='anonymous' src={profilePictureToBeRemoveFollower} alt="" />
                        </div>
                        <h3 className='text-[24px] font-bold'>
                            Remove follower?
                        </h3>
                        <span className='text-[14px] text-neutral-500 text-center px-4'>
                          Instagram will not tell {usernameToBeRemoveFollower} they were removed from your followers.
                        </span>
                  </div>
                  <button onClick={handleRemoveFollower} type="button" className='bg-transparent border-0 w-full h-[48px] text-[14px] font-bold text-red-500 border-t border-t-neutral-200 border-b border-b-neutral-200'>
                        Remove
                  </button>
                  <button onClick={closeModal} type="button" className='bg-transparent w-full h-[48px] text-[14px]'>
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
