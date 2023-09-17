import Image from "next/image";
import { Fragment, useCallback, useRef, useState } from "react";
import { Tab } from '@headlessui/react';

import { fetchFile } from "@ffmpeg/ffmpeg";
import * as videoCropHelpers from "@/helpers/cropVideo";
import domtoimage from 'dom-to-image';

const EditForm = ({
        uploads,
        setUploads,
        currentIndex,
        imgResultRef,
        contrast,
        setContrast,
        brightness,
        setBrightness,
        saturate,
        setSaturate,
        sepia,
        setSepia,
        grayScale,
        setGrayScale,
        generatingThumbNails,
        setGeneratingThumbNails,
        handleShowPreviousFile, 
        handleShowNextFile, 
        handleGoToPreviousForm, 
        handleGoToNextForm,
        FF,
        thumbNails,
        setThumbNails,
        videoMeta,
        setVideoMeta,
        setFilterName,
        rStart,
        setRStart,
        rEnd,
        setREnd,
        pStart,
        setPStart,
        isDisabled,
        setIsDisabled
    }: any) => {

    // * FOR COMPILING AFTER EDITING VIDEO OR IMAGE
    async function setAllBlob() {
        await domtoimage.toPng(imgResultRef.current)
                .then(function (dataUrl) {
                    const newUploads = uploads;
                    newUploads[currentIndex].dataUrl = dataUrl;
                    setUploads(newUploads);
                })
                .catch(function (error) {
                    console.error('oops, something went wrong!', error);
                });
    }
    // * END FOR COMPILING AFTER EDITING VIDEO OR IMAGE

    // * FOR VIDEO EDITING ONLY
    const videoRef = useRef<any>(null);
    const videoCoverPhotoRef = useRef<any>(null);
    const [pStartSecond, setPStartSecond] = useState(0);

    const getThumbnails = async ({ duration }: any) => {
        setGeneratingThumbNails(true);

        if (!FF.isLoaded()) await FF.load();

        let MAX_NUMBER_OF_IMAGES = 7;
        let NUMBER_OF_IMAGES = duration < MAX_NUMBER_OF_IMAGES ? duration : 7;
        let offset = duration === MAX_NUMBER_OF_IMAGES ? 1 : duration / NUMBER_OF_IMAGES;
    
        const arrayOfImageURIs = [];
        FF.FS("writeFile", uploads[currentIndex].name, await fetchFile(uploads[currentIndex].src));
    
        for (let i = 0; i < NUMBER_OF_IMAGES; i++) {
            let startTimeInSecs = videoCropHelpers.toTimeString(Math.round(i * offset));
    
            try {
                await FF.run(
                    "-ss",
                    startTimeInSecs,
                    "-i",
                    uploads[currentIndex].name,
                    "-t",
                    "00:00:1.000",
                    "-vf",
                    `scale=150:-1`,
                    `img${i}.png`
                );

                const data = FF.FS("readFile", `img${i}.png`);
        
                let blob = new Blob([data.buffer], { type: "image/png" });
                let dataURI = await videoCropHelpers.readFileAsBase64(blob);
                FF.FS("unlink", `img${i}.png`);
                arrayOfImageURIs.push(dataURI);
            } catch (error) {
                console.log({ message: error });
            }
        }
        setGeneratingThumbNails(false);
        return arrayOfImageURIs;
    };
    
    const handleLoadedData = async (e: any, currentFile: any) => {
        const el = e.target;

        const meta = {
            name: currentFile.name,
            duration: el.duration,
            videoWidth: el.videoWidth,
            videoHeight: el.videoHeight
        };

        let newCroppedUploads = uploads;
        newCroppedUploads[currentIndex].meta = meta;
        setVideoMeta(meta);
        setUploads(newCroppedUploads);
        if(thumbNails) {
            setIsDisabled(true);
            const thumbNails = await getThumbnails(meta);
            setThumbNails(thumbNails);
            setIsDisabled(false);
        }
    }

    const handleSetPoster = async (e: any) => {
        if(e.target.files.length === 1) {
            videoRef.current.pause();
            videoRef.current.load();
            let poster = e.target.files[0];
            let newUploads = uploads;
            newUploads[currentIndex].poster = poster;
            newUploads[currentIndex].pStart = 0;
            setUploads(newUploads);
        }
    }
    // * END FOR VIDEO EDITING ONLY

    // * FOR IMAGE EDITING ONLY
    const handleSetCustomFilterImage = useCallback((filterName: string, value: any) => {
        value = Number(value);

        if(filterName === 'brightness') {
            let newCroppedUploadsForBrightness = uploads;
            newCroppedUploadsForBrightness[currentIndex].filterName = "";
            newCroppedUploadsForBrightness[currentIndex].customFilter.brightness = value;
            setUploads(newCroppedUploadsForBrightness);
            setBrightness(value);
            setAllBlob();
        }

        if(filterName === 'contrast') {
            let newCroppedUploadsForContrast = uploads;
            newCroppedUploadsForContrast[currentIndex].filterName = "";
            newCroppedUploadsForContrast[currentIndex].customFilter.contrast = value;
            setUploads(newCroppedUploadsForContrast);
            setContrast(value);
            setAllBlob();
        }

        if(filterName === 'saturate') {
            let newCroppedUploadsForSaturate = uploads;
            newCroppedUploadsForSaturate[currentIndex].filterName = "";
            newCroppedUploadsForSaturate[currentIndex].customFilter.saturate = value;
            setUploads(newCroppedUploadsForSaturate);
            setSaturate(value);
            setAllBlob();
        }

        if(filterName === 'sepia') {
            let newCroppedUploadsForSepia = uploads;
            newCroppedUploadsForSepia[currentIndex].filterName = "";
            newCroppedUploadsForSepia[currentIndex].customFilter.sepia = value;
            setUploads(newCroppedUploadsForSepia);
            setSepia(value);
            setAllBlob();
        }
        if(filterName === 'grayScale') {
            let newCroppedUploadsForGrayScale = uploads;
            newCroppedUploadsForGrayScale[currentIndex].filterName = "";
            newCroppedUploadsForGrayScale[currentIndex].customFilter.grayScale = value;
            setUploads(newCroppedUploadsForGrayScale);
            setGrayScale(value);
            setAllBlob();
        }
    }, [setAllBlob, setBrightness, setContrast, setGrayScale, setSaturate, setSepia, setUploads, uploads, currentIndex]);

    const handleSetFilterImage = (filterName: string) => {
        if(imgResultRef.current.hasAttribute('style')) {
            imgResultRef.current.removeAttribute('style');
        }

        setFilterName(filterName);
    
        let newCroppedUploads = uploads;
        
        newCroppedUploads[currentIndex].filterName = filterName;
        newCroppedUploads[currentIndex].customFilter = {
            contrast: 100,
            brightness: 100,
            saturate: 100,
            sepia: 0,
            grayScale: 0
        };

        setUploads(newCroppedUploads);
        setContrast(100);
        setBrightness(100);
        setSaturate(100);
        setSepia(0);
        setGrayScale(0);
        setAllBlob();
    }
    // * END FOR IMAGE EDITING ONLY

    

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-none flex justify-between px-4 border-b border-grey">
                <button disabled={isDisabled} type="button" onClick={() => {handleGoToPreviousForm('editForm')}}>
                    <svg aria-label="Back" className="x1lliihq x1n2onr6 text-neutral-700" color="rgb(245, 245, 245)" fill="rgb(245, 245, 245)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Back</title><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="2.909" x2="22.001" y1="12.004" y2="12.004"></line><polyline fill="none" points="9.276 4.726 2.001 12.004 9.276 19.274" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline></svg>
                </button>
                <h3 className="flex-none text-base font-medium leading-6 text-gray-900 pb-3 pt-3 text-center">Edit</h3>
                <button className="text-[14px] font-medium text-blue-400 flex items-center cursor-pointer hover:text-sky-950" disabled={isDisabled}type="button" onClick={() => {handleGoToNextForm('editForm')}}>
                    Next
                </button>
            </div>
            <div className="h-full w-full flex items-center justify-center relative">
                <div className="flex w-full h-full">
                    <div className="flex-1 w-[704px] h-[704px] bg-neutral-900 flex justify-center items-center relative">
                        {
                            uploads[currentIndex].type === 'image/jpeg' || uploads[currentIndex].type === 'image/png' || uploads[currentIndex].type === 'image/jpg' || uploads[currentIndex].type === 'image/tiff' ?
                            <Image 
                                width={1000}
                                height={1000}
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
                                src={uploads[currentIndex].srcBlob + `#t=${pStart}`} 
                                ref={videoRef}
                                onLoadedMetadata={(e) => {handleLoadedData(e, uploads[currentIndex])}} 
                                className="h-full object-cover w-[736px] h-[736px] object-contain"
                                controls
                                onClick={() => {
                                    if(!(uploads[currentIndex].hasOwnProperty('poster'))) {
                                        if(videoRef.current.paused && pStartSecond !== 0) {
                                            videoRef.current.currentTime = 0;
                                        }else {
                                            videoRef.current.currentTime = pStartSecond;
                                        }
                                    }
                                }}
                                >
                            </video>
                        }
                        {
                            currentIndex !== 0 && 
                            <button disabled={isDisabled} type="button" onClick={() => {
                                handleShowPreviousFile(currentIndex)
                            }} className="absolute bottom-[50%] left-[10px] h-[30px] bg-neutral-900 w-[35px] h-[35px] flex items-center justify-center rounded-[50%]">
                                <svg aria-label="Left chevron" className="_ab6- ml-[-3px]" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"><polyline fill="none" points="16.502 3 7.498 12 16.502 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline></svg>
                            </button>
                        }
                        {
                            !(currentIndex === uploads.length - 1) && 
                            <button disabled={isDisabled} type="button" onClick={() => {
                                handleShowNextFile(currentIndex)
                            }} className="absolute bottom-[50%] right-[10px] h-[30px] bg-neutral-900 w-[35px] h-[35px] flex items-center justify-center rounded-[50%]">
                                <svg aria-label="Right chevron" className="_ab6- ml-[3px]" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"><polyline fill="none" points="8 3 17.004 12 8 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline></svg>
                            </button>
                        }
                    </div>
                    <div className="flex-none w-[340px] h-[736px] bg-white">
                        {
                            uploads[currentIndex].type === 'image/jpeg' || uploads[currentIndex].type === 'image/png' || uploads[currentIndex].type === 'image/jpg' || uploads[currentIndex].type === 'image/tiff' ?
                            <Tab.Group>
                                <Tab.List className="flex">
                                    <Tab as={Fragment}>
                                        {({ selected }) => (
                                            <button type="button"
                                                className={
                                                    selected ? 'text-sm font-semibold flex-1 py-2 border-grey border-b text-[#00376b]' : 'text-sm font-semibold flex-1 py-2 bg-white text-black border-grey-500 border-b opacity-50'
                                                }
                                            >
                                                Filters
                                            </button>
                                        )}
                                    </Tab>
                                    
                                    <Tab as={Fragment}>
                                        {({ selected }) => (
                                            <button type="button"
                                                className={
                                                    selected ? 'text-sm font-semibold flex-1 py-2 border-grey border-b text-[#00376b]' : 'text-sm font-semibold flex-1 py-2 bg-white text-black border-grey-500 border-b opacity-50'
                                                }
                                            >
                                                Adjustments
                                            </button>
                                        )}
                                    </Tab>
                                </Tab.List>
                                <Tab.Panels className="w-full h-auto">
                                    <Tab.Panel className="w-full h-full">
                                        <div className="flex flex-wrap w-full px-30">
                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage('aden')}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Aden.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'aden' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'aden' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Aden</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("clarendon")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Clarendon.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'clarendon' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'clarendon' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Clarendon</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("crema")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Crema.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'crema' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'crema' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Crema</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("gingham")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Gingham.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'gingham' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'gingham' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Gingham</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("juno")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Juno.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'juno' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'juno' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Juno</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("lark")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Lark.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'lark' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'lark' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Lark</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("ludwig")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Ludwig.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'ludwig' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'ludwig' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Ludwig</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("moon")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Moon.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'moon' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'moon' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Moon</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("normal")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Normal.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'normal' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'normal' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Original</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("perpetua")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Perpetua.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'perpetua' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'perpetua' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Perpetua</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("reyes")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Reyes.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'reyes' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'reyes' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Reyes</span>
                                            </div>

                                            <div className="w-[33.3%] mt-[16px] flex items-center justify-center flex-col cursor-pointer">
                                                <div onClick={() => {handleSetFilterImage("slumber")}} className="ml-[8px] mr-[8px] mb-[8px] bg-red">
                                                    <Image src="/filter_image/Slumber.jpg" width={100} height={100} className={`w-[86px] h-[86px] rounded-sm ${uploads[currentIndex].filterName === 'slumber' && "border-[2px] border-[#0095F6] rounded-sm"} `} alt="none"/>
                                                </div>
                                                <span className={`text-sm ${uploads[currentIndex].filterName === 'slumber' ? "font-medium text-[#0095F6]" : "text-neutral-500"}`}>Slumber</span>
                                            </div>
                                        </div>
                                    </Tab.Panel>
                                    <Tab.Panel>
                                        <div className="w-full h-full px-4 py-3">
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3>Brightness</h3>
                                                    <button type="button">Reset</button>
                                                </div>
                                                <div className="flex">
                                                    <div className="flex-1">
                                                    <input value={brightness} onChange={(e) => {handleSetCustomFilterImage('brightness', e.currentTarget.value)}} min={0} max={200} type="range" className="w-full appearance-none bg-red [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-[2px] [&::-webkit-slider-thumb]:appearance-none  [&::-webkit-slider-thumb]:h-[20px]  [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:rounded-full  [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-8px] thumb-center"/>
                                                    </div>
                                                    <div className="w-[24px]">
                                                        <div className="text-right text-sm pt-3">{brightness}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3>Contrast</h3>
                                                    <button type="button">Reset</button>
                                                </div>
                                                <div className="flex">
                                                    <div className="flex-1">
                                                    <input value={contrast} onChange={(e) => {handleSetCustomFilterImage('contrast', e.currentTarget.value)}} min={0} max={200} type="range" className="w-full appearance-none bg-red [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-[2px] [&::-webkit-slider-thumb]:appearance-none  [&::-webkit-slider-thumb]:h-[20px]  [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:rounded-full  [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-8px] thumb-center"/>
                                                    </div>
                                                    <div className="w-[24px]">
                                                        <div className="text-right text-sm pt-3">{contrast}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3>Saturate</h3>
                                                    <button type="button">Reset</button>
                                                </div>
                                                <div className="flex">
                                                    <div className="flex-1">
                                                        <input value={saturate} onChange={(e) => {handleSetCustomFilterImage('saturate', e.currentTarget.value)}} min={0} max={200} type="range" className="w-full appearance-none bg-red [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-[2px] [&::-webkit-slider-thumb]:appearance-none  [&::-webkit-slider-thumb]:h-[20px]  [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:rounded-full  [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-8px] thumb-center"/>
                                                    </div>
                                                    <div className="w-[24px]">
                                                        <div className="text-right text-sm pt-3">{saturate}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3>Sepia</h3>
                                                    <button type="button">Reset</button>
                                                </div>
                                                <div className="flex">
                                                    <div className="flex-1">
                                                    <input value={sepia} onChange={(e) => {handleSetCustomFilterImage('sepia', e.currentTarget.value)}} min={0} max={200} type="range" className="w-full appearance-none bg-red [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-[2px] [&::-webkit-slider-thumb]:appearance-none  [&::-webkit-slider-thumb]:h-[20px]  [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:rounded-full  [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-8px] thumb-center"/>
                                                    </div>
                                                    <div className="w-[24px]">
                                                        <div className="text-right text-sm pt-3">{sepia}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3>Gray Scale</h3>
                                                    <button type="button">Reset</button>
                                                </div>
                                                <div className="flex">
                                                    <div className="flex-1">
                                                    <input value={grayScale} onChange={(e) => {handleSetCustomFilterImage('grayScale', e.currentTarget.value)}} min={0} max={200} type="range" className="w-full appearance-none bg-red [&::-webkit-slider-runnable-track]:bg-black/10 [&::-webkit-slider-runnable-track]:h-[2px] [&::-webkit-slider-thumb]:appearance-none  [&::-webkit-slider-thumb]:h-[20px]  [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:rounded-full  [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:mt-[-8px] thumb-center"/>
                                                    </div>
                                                    <div className="w-[24px]">
                                                        <div className="text-right text-sm pt-3">{grayScale}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Tab.Panel>
                                </Tab.Panels>
                            </Tab.Group> :
                            <div className="p-4">
                                <div className="flex justify-between mb-10 flex-col">
                                    <div className="flex justify-between mb-4">
                                        <h3 className="font-bold">Cover photo</h3>
                                        <label htmlFor="uploadPosterImage" className="text-sm font-medium text-[#0094f4] hover:cursor-pointer">Select from computer</label>
                                        <input id="uploadPosterImage" type="file" style={{visibility: 'hidden'}} className="text-sm font-medium text-[#0094f4] absolute" accept="image/png, image/jpg, image/tiff, image/jpeg" onChange={(e) => {handleSetPoster(e); e.target.value = ""}}/>
                                    </div>
                                    <div>
                                        { 
                                            generatingThumbNails ? <h1>Loading...</h1> : 
                                            <div className="w-auto flex flex-start border border-neutral-100 relative h-[6rem] rounded-[10px]">
                                                {
                                                    thumbNails.map((imgURL: any, index: any) => (
                                                            <div className="flex-1" key={index}>
                                                                {
                                                                    index === 0 ?
                                                                    <Image height={50} width={50} className="h-full rounded-l-[5px] object-contain" src={imgURL} alt={`sample_video_thumbnail_${index}`} />
                                                                    :
                                                                    index === thumbNails.length - 1 ?
                                                                    <Image height={50} width={50} className="h-full rounded-r-[5px] object-contain" src={imgURL} alt={`sample_video_thumbnail_${index}`} />
                                                                    :
                                                                    <Image height={50} width={50} className="h-full object-contain" src={imgURL} alt={`sample_video_thumbnail_${index}`} />
                                                                }
                                                            </div>
                                                        )
                                                    )
                                                }

                                                <div 
                                                    className="
                                                        w-[70px] 
                                                        border-red-500 
                                                        absolute 
                                                        h-[110%]
                                                        rounded-[5px]
                                                        translate-x-[-40%]
                                                        overflow-hidden
                                                        border-2
                                                        border-white
                                                        shadow-[0px_0px_10px_1px_rgba(0,0,0,0.5)]
                                                        translate-y-[-4%]
                                                        flex
                                                        items-center
                                                        transition-[1s]
                                                    "
                                                    style={{
                                                        left: `${Math.ceil((pStartSecond / videoMeta.duration ) * 103) < 10 
                                                        ? 9 : 
                                                        Math.ceil((pStartSecond / videoMeta.duration ) * 98)
                                                        }%`,
                                                    }}
                                                    data-start={videoCropHelpers.toTimeString((pStart / 100) * videoMeta.duration, false)}
                                                    data-end={videoCropHelpers.toTimeString((rEnd / 100) * videoMeta.duration, false)}
                                                >
                                                    <video ref={videoCoverPhotoRef} src={uploads[currentIndex].srcBlob} className="w-full rounded-[5px]" onLoadedData={() => {
                                                        videoCoverPhotoRef.current.currentTime = pStartSecond;
                                                    }}></video>

                                                </div>
                                                    
                                                <input 
                                                    className="
                                                        [&::-webkit-slider-thumb]:cursor-pointer 
                                                        [&::-webkit-slider-thumb]:pointer-events-auto 
                                                        [&::-webkit-slider-thumb]:appearance-none 
                                                        [&::-webkit-slider-thumb]:bg-transparent
                                                        [&::-webkit-slider-thumb]:h-[70px] 
                                                        [&::-webkit-slider-thumb]:w-[70px] 
                                                        [&::-webkit-slider-thumb]:rounded-full 
                                                        
                                                        absolute 
                                                        appearance-none 
                                                        left-0 
                                                        right-0 
                                                        translate-y-[-50%] 
                                                        top-[50%] 
                                                        bg-transparent
                                                        " 
                                                    type="range" 
                                                    min={0} 
                                                    max={7} 
                                                    value={pStartSecond}
                                                    onInput={(e: any) => {
                                                        setPStartSecond(e.target.value);
                                                        videoCoverPhotoRef.current.currentTime = e.target.value;
                                                    }} 
                                                    onMouseUp={(e: any) => {
                                                        let newUploads = uploads;
                                                        newUploads[currentIndex].pStart = Number(pStartSecond);
                                                        
                                                        if(newUploads[currentIndex].hasOwnProperty('poster')) {
                                                            delete newUploads[currentIndex].poster;
                                                        }
                                                        
                                                        setUploads(newUploads);
                                                        setPStart(pStartSecond);
                                                    }}
                                                />
                                            </div> 
                                        }
                                    </div>
                                </div>
                                <div className="flex justify-between flex-col">
                                    <h3 className="font-bold mb-4">Trim</h3>
                                    { 
                                        generatingThumbNails ? <h1>Loading...</h1> : 
                                        <>
                                            <div className="w-[308px] flex flex-start border border-neutral-200 relative h-[5rem] rounded-[10px]">
                                                {
                                                    thumbNails.map((imgURL: any, index: any) => (
                                                            <div className="flex-1" key={index}>
                                                                {
                                                                    index === 0 ?
                                                                    <Image height={50} width={50} className="h-full rounded-l-[5px] object-contain" src={imgURL} alt={`sample_video_thumbnail_${index}`} />
                                                                    :
                                                                    index === thumbNails.length - 1 ?
                                                                    <Image height={50} width={50} className="h-full rounded-r-[5px] object-contain" src={imgURL} alt={`sample_video_thumbnail_${index}`} />
                                                                    :
                                                                    <Image height={50} width={50} className="h-full object-contain" src={imgURL} alt={`sample_video_thumbnail_${index}`} />
                                                                }
                                                            </div>
                                                        )
                                                    )
                                                }

                                                <div 
                                                    className="
                                                    border-y-[3px] 
                                                    border-x-[10px] 
                                                    border-white 
                                                    absolute h-[100%] 
                                                    translate-y-[0%] 
                                                    shadow-[0px_5px_10px_1px_rgba(0,0,0,0.2)]
                                                    before:content-['']
                                                    rounded-[5px]
                                                    before:block
                                                    before:w-[2px]
                                                    before:h-[22px]
                                                    before:bg-black
                                                    before:absolute
                                                    before:top-[40%]
                                                    before:left-[-6px]
                                                    before:translate-y-[-5%] 

                                                    after:block
                                                    after:w-[2px]
                                                    after:h-[22px]
                                                    after:bg-black
                                                    after:absolute
                                                    after:top-[40%]
                                                    after:right-[-6px]
                                                    after:translate-y-[-5%] 
                                                    transition-[1s]
                                                    "
                                                    style={{
                                                        width: `calc(${rEnd - rStart}%)`, 
                                                        left: `${rStart}%`,
                                                    }}
                                                    data-start={videoCropHelpers.toTimeString((rStart / 100) * videoMeta.duration, false)}
                                                    data-end={videoCropHelpers.toTimeString((rEnd / 100) * videoMeta.duration, false)}
                                                ></div>

                                                <input 
                                                    className="
                                                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-transparent
                                                    pointer-events-none 
                                                    absolute 
                                                    appearance-none 
                                                    left-0 
                                                    right-0 
                                                    translate-y-[-50%] 
                                                    top-[50%] 
                                                    background 
                                                    bg-transparent
                                                    " 
                                                    type="range" 
                                                    min={0} 
                                                    max={100} 
                                                    onInput={(e: any) => {
                                                        let newCroppedUploads = uploads;
                                                        newCroppedUploads[currentIndex].rStart = e.target.value;
                                                        setUploads(newCroppedUploads);
                                                        setRStart(e.target.value);
                                                    }} 
                                                    value={rStart}  
                                                />

                                                <input 
                                                    className="
                                                    [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-transparent
                                                    pointer-events-none 
                                                    absolute 
                                                    appearance-none 
                                                    left-0 
                                                    right-0 
                                                    translate-y-[-50%] 
                                                    top-[50%] 
                                                    background 
                                                    bg-transparent" 
                                                    type="range" 
                                                    min={0} 
                                                    max={100} 
                                                    onInput={(e: any) => {
                                                        let newCroppedUploads = uploads;
                                                        newCroppedUploads[currentIndex].rEnd = e.target.value;
                                                        setUploads(newCroppedUploads);
                                                        setREnd(e.target.value);
                                                    }} 
                                                    value={rEnd}  
                                                />
                                            </div> 

                                            <div className="w-[308px] flex justify-between mt-2 h-[100px]">
                                                <div className="w-[20px] flex flex-col items-center">
                                                    <div className="w-[4px] h-[4px] bg-neutral-500 rounded-[50%]"></div>
                                                    <span className="text-[14px] text-neutral-500 mt-1">0s</span>
                                                </div>

                                                <div className="w-[20px] flex flex-col items-center">
                                                    <div className="w-[4px] h-[4px] bg-neutral-300 rounded-[50%]"></div>
                                                </div>
                                                <div className="w-[20px] flex flex-col items-center">
                                                    <div className="w-[4px] h-[4px] bg-neutral-300 rounded-[50%]"></div>
                                                </div>
                                                <div className="w-[20px] flex flex-col items-center">
                                                    <div className="w-[4px] h-[4px] bg-neutral-300 rounded-[50%]"></div>
                                                </div>

                                                <div className="w-[20px] flex flex-col items-center">
                                                    <div className="w-[4px] h-[4px] bg-neutral-500 rounded-[50%]"></div>
                                                    <span className="text-[14px] text-neutral-500 mt-1">{Math.ceil(videoMeta.duration) / 2}s</span>
                                                </div>

                                                <div className="w-[20px] flex flex-col items-center">
                                                    <div className="w-[4px] h-[4px] bg-neutral-300 rounded-[50%]"></div>
                                                </div>
                                                <div className="w-[20px] flex flex-col items-center">
                                                    <div className="w-[4px] h-[4px] bg-neutral-300 rounded-[50%]"></div>
                                                </div>
                                                <div className="w-[20px] flex flex-col items-center">
                                                    <div className="w-[4px] h-[4px] bg-neutral-300 rounded-[50%]"></div>
                                                </div>

                                                <div className="w-[20px] flex flex-col items-center">
                                                    <div className="w-[4px] h-[4px] bg-neutral-500 rounded-[50%]"></div>
                                                    <span className="text-[14px] text-neutral-500 mt-1">{Math.ceil(videoMeta.duration)}s</span>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditForm;