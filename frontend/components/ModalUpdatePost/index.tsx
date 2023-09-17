import { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import { useState, useEffect, SetStateAction, useRef } from "react";
import dynamic from "next/dynamic";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import * as Yup from 'yup';
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { escape } from 'he';
import DOMPurify from "dompurify";
import Image from "next/image";

const EmojiPicker = dynamic(
    () => {
      return import('emoji-picker-react');
    },
    { ssr: false }
);

const ModalUpdatePost = ({
        post,
        showModalUpdatePost,
        setShowModalUpdatePost,
        authenticatedUser,
    }: any) => {
    
    const cancelButtonRef = useRef<any>(null);

    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const closeModal = () => {
        setShowModalUpdatePost(false);
    }

    const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent, setFieldValue: any, values: any) => {
        setFieldValue('caption', values.caption + emojiData.emoji);
    }

    const handleToggleEmojiPicker = () => {
        if(showEmojiPicker) {
            setShowEmojiPicker(false);
        }else {
            setShowEmojiPicker(true);
        }
    }

    const initialValuesUpdatePost = {
        caption: post.caption,
        alt_text: post.alt_text
    }

    const validationSchemaUpdatePost = Yup.object().shape({
        caption: Yup.string()
            .notRequired()
            .trim()
            .max(2200, 'Caption must not exceed 2200 characters.')
            .test(
              'caption-name-xss-nosql',
              'Caption contains potentially unsafe characters or invalid characters',
              (values: any) => {
                if(values === undefined) {
                    return true;
                }else {
                    const sanitizedValue = escape(values);
                    return sanitizedValue === values; // Check if sanitized value is the same as the original value
                }
              }
            ),
        alt_text: Yup.string()
            .notRequired()
            .trim()
            .max(255, 'Alt text must not exceed 255 characters.')
            .matches(/^[a-zA-Z0-9_ \-\.!@#$%^&*()+=?/\\[\]{}|~<>]+$/, 'Alt text must valid alt text only. Use valid characters.')
            .test(
              'alt-text-name-xss-nosql.',
              'Alt Text contains potentially unsafe characters or invalid characters.',
              (values: any) => {
                if(values === undefined) {
                    return true;
                }else {
                    const sanitizedValue = escape(values);
                    return sanitizedValue === values; // Check if sanitized value is the same as the original value
                }
              }
            )
    });

    const handleSubmitUpdatePost = async (values: any) => {
        const {caption, alt_text} = values;
        const sanitizedCaption = DOMPurify.sanitize(caption);
        const sanitizedAltText = DOMPurify.sanitize(alt_text);

        setIsDisabled(true);

        fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                post_id: post._id,
                caption: sanitizedCaption,
                alt_text: sanitizedAltText
            })
        })
        .then((response) => response.json())
        .then((result) => {
            if(result.status === 'ok') {
                setIsDisabled(false);
                alert('sucess');
                window.location.href = `/${authenticatedUser.username}`
            }
        })
        .catch((error) => {
            setIsDisabled(false);
            alert(error);
        });
    }

    useEffect(() => {
        
    }, []);

    return (
        <div className="w-full h-full" data-type-text="1">
            <Transition appear show={showModalUpdatePost} as={Fragment}>
                <Dialog as="div" className="relative z-[803]" onClose={(e) => {
                    cancelButtonRef.current.click();
                }}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-100"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-60"></div>
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
                                <Dialog.Panel className="transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                    <div className="flex flex-col h-[704px] w-full" id="container">
                                        <div className="flex-none h-[50px] flex justify-between px-4 border-b border-grey">
                                            <button ref={cancelButtonRef} type="button" onClick={closeModal} className="text-[14px]">
                                                Cancel
                                            </button>
                                            <h3 id="title" className="flex-none text-base font-medium leading-6 text-gray-900 pb-3 pt-3 text-center">Edit info</h3>
                                            <label htmlFor="updatePostSubmitButton" className="text-[14px] font-medium text-blue-400 flex items-center cursor-pointer hover:text-sky-950">
                                                Done
                                            </label>
                                        </div>
                                        <div className="h-[calc(704px-50px)] w-full flex items-center justify-center relative">
                                            <div className="flex w-full h-full">
                                                <div className="flex-1 w-[704px] h-[calc(704px-50px)] bg-neutral-900 flex justify-center items-center relative">
                                                    <Splide options={ { rewind: false, arrows: post.post.length > 1, drag: false } } aria-label="React Splide Example">
                                                        {post.post.map((eachPost: any, index: number) => (
                                                            <SplideSlide key={index}>
                                                                {eachPost.type === 'video/mp4' ? 
                                                                    <div className="h-full w-full flex items-center justify-center bg-black">
                                                                        <video crossOrigin="anonymous" src={eachPost.post} className="h-[calc(704px-50px)] aspect-auto" controls/>
                                                                    </div>
                                                                    : 
                                                                    <div className="h-full w-full flex items-center justify-center bg-black">
                                                                        <Image priority width={5000} height={5000} crossOrigin="anonymous" src={eachPost.post} alt={post.alt_text} className="h-[calc(704px-50px)] object-contain aspect-auto"/>
                                                                    </div>
                                                                }
                                                            </SplideSlide>
                                                        ))}
                                                    </Splide>
                                                </div>
                                                <div className="flex-none w-[340px] h-[704px] bg-white p-5 relative">
                                                    <div className="flex gap-[10px] mb-4">
                                                        <Image width={28} height={28} src={`${authenticatedUser.profile.profilePicture}`} alt="User profile picture" crossOrigin="anonymous" className="w-[28px] h-[28px] object-cover rounded-[50%]" />
                                                        <h3>{authenticatedUser.username}</h3>
                                                    </div>
                                                    <Formik validationSchema={validationSchemaUpdatePost} initialValues={initialValuesUpdatePost} onSubmit={handleSubmitUpdatePost}>
                                                        {({ setFieldValue, values }) => (
                                                        <Form>
                                                            <div>
                                                                <Field as="textarea" id="caption" name="caption" disabled={isDisabled} className={`focus:outline-0 w-full bg-[#ffffff] h-[168px] border border-[#ffffff] mb-2 resize-none ${isDisabled && `opacity-50`}`} placeholder='Write a caption...' value={values.caption} 
                                                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => {
                                                                        setFieldValue('caption', e.target.value);
                                                                    }} 
                                                                    onClick={(e: any) => {    
                                                                        setShowEmojiPicker(false);
                                                                    }}
                                                                />
                                                                <ErrorMessage name="caption" component="div" className="text-left w-full flex justify-left text-[14px] mb-3 text-red-600"/>

                                                                <div className="flex justify-between mb-6 gap-[20px] items-center">
                                                                    <button type="button" onClick={handleToggleEmojiPicker}>
                                                                        <svg aria-label="Emoji" className="x1lliihq x1n2onr6" color="rgb(168, 168, 168)" fill="rgb(168, 168, 168)" height="20" role="img" viewBox="0 0 24 24" width="20"><title>Emoji</title><path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path></svg>
                                                                    </button>
                                                                </div>
                                                                {
                                                                    showEmojiPicker && <div className="absolute">
                                                                        <EmojiPicker emojiStyle={EmojiStyle.NATIVE} onEmojiClick={(emojiData, event) => {
                                                                            onEmojiClick(emojiData, event, setFieldValue, values);
                                                                        }} width={300} height={350}/>
                                                                    </div>
                                                                }
                                                            </div>
                                                            
                                                            <div>
                                                                <h4 className="mb-4">Accessibility</h4>
                                                                <div className="text-[12px] leading-[16px] mb-4 text-[#a8a8a8]">Alt text describes your photos for people with visual impairments. Alt text will be automatically created for your photos or you can choose to write your own.</div>
                                                                <div className="flex gap-4 items-center">
                                                                    <Image width={28} height={28} src={`${authenticatedUser.profile.profilePicture}`} alt="User profile picture" crossOrigin="anonymous" className="w-[28px] h-[28px] object-cover rounded-[50%]" />
                                                                    <Field type="text" id="alt_text" name="alt_text" disabled={isDisabled} className={`flex-1 bg-[#fafafa] leading-[25px] text-[14px] py-[8px] px-[12px] border border-[#e9e9e9] rounded-sm ${isDisabled && `opacity-50`}`} value={values.alt_text} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {
                                                                        setFieldValue('alt_text', e.target.value);
                                                                    }} placeholder='Write alt text...'/>
                                                                    <ErrorMessage name="alt_text" component="div" className="text-left w-full flex justify-left text-[14px] mb-3 text-red-600"/>
                                                                </div>
                                                            </div>

                                                            <button type="submit" className="hidden" id="updatePostSubmitButton"></button>
                                                        </Form>
                                                        )}
                                                    </Formik>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}

export default ModalUpdatePost;