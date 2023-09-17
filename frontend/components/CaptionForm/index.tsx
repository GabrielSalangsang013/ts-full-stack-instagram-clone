import { Field } from "formik";
import { EmojiClickData, EmojiStyle } from "emoji-picker-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import OptimizeImage from "@/helpers/optimizedImage";
import Image from "next/image";

const EmojiPicker = dynamic(
    () => {
      return import('emoji-picker-react');
    },
    { ssr: false }
);

const CaptionForm = ({
    uploads,
    currentIndex,
    setFieldValue,
    isDisabled,
    imgResultRef,
    errors,
    contrast,
    brightness,
    saturate,
    sepia,
    grayScale,
    handleShowNextFile,
    handleShowPreviousFile,
    handleGoToPreviousForm,
    authenticatedUser
    }: any) => {
    
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [caption, setCaption] = useState("");
    const [altText, setAltText] = useState("");

    const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
        setCaption(caption + emojiData.emoji);
        setFieldValue("caption", caption + emojiData.emoji);
    }

    const handleToggleEmojiPicker = () => {
        if(showEmojiPicker) {
            setShowEmojiPicker(false);
        }else {
            setShowEmojiPicker(true);
        }
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-none flex justify-between px-4 border-b border-grey">
                <button type="button" onClick={() => {handleGoToPreviousForm('captionForm')}}>
                <svg aria-label="Back" className="x1lliihq x1n2onr6 text-neutral-700" color="rgb(245, 245, 245)" fill="rgb(245, 245, 245)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Back</title><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="2.909" x2="22.001" y1="12.004" y2="12.004"></line><polyline fill="none" points="9.276 4.726 2.001 12.004 9.276 19.274" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline></svg>
                </button>
                <h3 className="flex-none text-base font-medium leading-6 text-gray-900 pb-3 pt-3 text-center">Create new post</h3>
                <button className="text-[14px] font-medium text-blue-400 flex items-center cursor-pointer hover:text-sky-950" type="submit" onClick={() => {setFieldValue("uploads", uploads);}}>
                    Share
                </button>
            </div>
            <div className="h-full w-full flex items-center justify-center relative">
                <div className="flex w-full h-full">
                    <div className="flex-1 w-[704px] h-[704px] bg-neutral-900 flex justify-center items-center relative">
                        {
                            uploads[currentIndex].type === 'image/jpeg' || uploads[currentIndex].type === 'image/png' || uploads[currentIndex].type === 'image/jpg' || uploads[currentIndex].type === 'image/tiff' ?
                            <Image 
                                width={704} height={704}
                                ref={imgResultRef} 
                                src={uploads[currentIndex].src} 
                                alt="nothing" 
                                className={`
                                    ${uploads[currentIndex].aspect === 16/9 ? `w-full object-contain` : `h-full object-contain`}
                                    ${uploads[currentIndex].filterName !== "" ? 
                                    `filter-${uploads[currentIndex].filterName}` 
                                    : ""}
                                `}  
                                style={uploads[currentIndex].filterName === "" ? {
                                    filter: `
                                    contrast(${contrast}%) 
                                    brightness(${brightness}%) 
                                    saturate(${saturate}%) 
                                    sepia(${sepia}%) 
                                    grayscale(${grayScale}%)`
                                }: {}}
                            /> :
                            <video
                                poster={
                                    uploads[currentIndex].hasOwnProperty('poster') ?
                                    URL.createObjectURL(uploads[currentIndex].poster) : "false"
                                } 
                                src={uploads[currentIndex].src} 
                                className="w-[704px] h-[704px] object-cover" 
                                controls>
                            </video>
                        }
                        {
                            currentIndex !== 0 && 
                            <button type="button" onClick={() => {
                                handleShowPreviousFile(currentIndex)
                            }} className="absolute bottom-[50%] left-[10px] h-[30px] bg-neutral-900 w-[35px] h-[35px] flex items-center justify-center rounded-[50%]">
                                <svg aria-label="Left chevron" className="_ab6- ml-[-3px]" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"><polyline fill="none" points="16.502 3 7.498 12 16.502 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline></svg>
                            </button>
                        }
                        {
                            !(currentIndex === uploads.length - 1) && 
                            <button type="button" onClick={() => {
                                handleShowNextFile(currentIndex)
                            }} className="absolute bottom-[50%] right-[10px] h-[30px] bg-neutral-900 w-[35px] h-[35px] flex items-center justify-center rounded-[50%]">
                                <svg aria-label="Right chevron" className="_ab6- ml-[3px]" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"><polyline fill="none" points="8 3 17.004 12 8 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline></svg>
                            </button>
                        }
                    </div>
                    <div className="flex-none w-[340px] h-[704px] bg-white p-5">
                        <div className="flex gap-[10px] mb-4">
                            <Image width={64} height={64} src={`${OptimizeImage(authenticatedUser.profile.profilePicture, ['w_64', 'h_64', 'c_fill'])}`} alt="User profile picture" crossOrigin="anonymous" className="w-[28px] h-[28px] object-cover rounded-[50%]" />
                            <h3>{authenticatedUser.username}</h3>
                        </div>

                        <div>
                            <textarea id="caption" name="caption" disabled={isDisabled} className={`focus:outline-0 w-full bg-[#ffffff] h-[168px] border border-[#ffffff] mb-2 resize-none ${isDisabled && `opacity-50`}`} placeholder='Write a caption...' value={caption} onChange={(e: any) => {
                                setCaption(e.target.value);
                                setFieldValue("caption", e.target.value);
                            }} onClick={() => {
                                setShowEmojiPicker(false);
                            }}/>

                            <div className="flex justify-between mb-6 gap-[20px] items-center">
                                <button type="button" onClick={handleToggleEmojiPicker}>
                                    <svg aria-label="Emoji" className="x1lliihq x1n2onr6" color="rgb(168, 168, 168)" fill="rgb(168, 168, 168)" height="20" role="img" viewBox="0 0 24 24" width="20"><title>Emoji</title><path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path></svg>
                                </button>

                                {errors.caption && <div className="text-[12px] leading-[16px] text-red-700">{errors.caption}</div>}
                            </div>

                                {
                                    showEmojiPicker && <div className="absolute">
                                        <EmojiPicker emojiStyle={EmojiStyle.NATIVE} onEmojiClick={onEmojiClick} width={300} height={350}/>
                                    </div>
                                }

                        </div>
                        
                        <div>
                            <h4 className="mb-4">Accessibility</h4>
                            <div className="text-[12px] leading-[16px] mb-4 text-[#a8a8a8]">Alt text describes your photos for people with visual impairments. Alt text will be automatically created for your photos or you can choose to write your own.</div>
                            <div className="flex gap-4 items-center">
                                <Image width={64} height={64} src={`${OptimizeImage(authenticatedUser.profile.profilePicture, ['w_64', 'h_64', 'c_fill'])}`} alt="User profile picture" crossOrigin="anonymous" className="w-[28px] h-[28px] object-cover rounded-[50%]" />
                                <Field type="text" id="alt_text" name="alt_text" disabled={isDisabled} className={`flex-1 bg-[#fafafa] leading-[25px] text-[14px] py-[8px] px-[12px] border border-[#e9e9e9] rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Write alt text...' value={altText} onChange={(e: any) => {
                                    setAltText(e.target.value);
                                    setFieldValue("alt_text", e.target.value);
                                }} onClick={() => {
                                    setShowEmojiPicker(false);
                                }}/>
                            </div>
                            {errors.alt_text && errors.alt_text}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CaptionForm;