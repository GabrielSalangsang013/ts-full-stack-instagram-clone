import Cropper from 'react-easy-crop';
import { useState } from 'react';
import * as videoCropHelpers from "@/helpers/cropVideo";
import Image from 'next/image';

const CropForm = ({
        uploads, 
        currentIndex, 
        setCurrentIndex,
        errors, 
        imgResultRef, 
        setUploads, 
        cropped,
        zoomed,
        setCropped,
        setZoomed,
        handleShowPreviousFile, 
        handleShowNextFile, 
        handleGoToPreviousForm, 
        handleGoToNextForm,
        showRatioMenu,
        setShowRatioMenu,
        aspect,
        setAspect,
        showZoomMenu,
        setShowZoomMenu,
        showUploadMenu,
        setShowUploadMenu,
        showShowUploadsForm,
        setShowCropForm,
        setFieldValue,
        allFileTypeUploads,
        setAllFileTypeUploads
    }: any) => {

    const [showGrid, setShowGrid] = useState(false);

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        let croppedUploads = uploads;
        croppedUploads[currentIndex].croppedAreaPixels = croppedAreaPixels;
        setUploads(croppedUploads);
    }

    const handleCropChange = (crop: any) => {
        let croppedUploads = uploads;
        croppedUploads[currentIndex].crop = crop;
        setUploads(croppedUploads);
        setCropped(crop);
    }

    const handleZoomChange = (zoom: any) => {
        let croppedUploads = uploads;
        croppedUploads[currentIndex].zoom = zoom;
        setUploads(croppedUploads);
        setZoomed(zoom);
    }

    const handleShowRatioMenu = () => {
        if(showRatioMenu) {
            setShowRatioMenu(false); 
        }else {
            setShowRatioMenu(true);
        }
    }

    const handleUpdateAspect = (aspect: any) => {
        let newUploads = uploads;
        newUploads[currentIndex].aspect = aspect;
        setAspect(aspect);
        setUploads(newUploads);
    }

    const handleShowZoomMenu = () => {
        if(showZoomMenu) {
            setShowZoomMenu(false); 
        }else {
            setShowZoomMenu(true);
        }
    }

    const handleShowUploadMenu = () => {
        if(showUploadMenu) {
            setShowUploadMenu(false); 
        }else {
            setShowUploadMenu(true);
        }
    }

    const handleRemoveUpload = (index: number) => {
        let newUploads = uploads;
        let filteredUploads = newUploads.filter((upload: any, currentIndex: number) => currentIndex !== index);
        if(filteredUploads.length === 0) {
            showShowUploadsForm(true);
            setShowCropForm(false);
            setShowUploadMenu(false);
        }
        setUploads(filteredUploads);
        if(index !== 0) {
            setCurrentIndex(index - 1);
        }else {
            setCurrentIndex(index);
        }

        let newAllFileTypeUploads = allFileTypeUploads.filter((file: any) => uploads[index].name !== file.name);
        setAllFileTypeUploads(newAllFileTypeUploads);
        setFieldValue('post', newAllFileTypeUploads);
    }

    const handleUpdateCurrentIndex = (index: number) => {
        setCurrentIndex(index);
        setCropped(uploads[index].crop);
        setZoomed(uploads[index].zoom);
        setAspect(uploads[index].aspect);
    }

    const handleNewUploads = async (e:any) => {
        
        let newUploadsFileTypeArray = [];
        
        for(let i = 0; i < e.target.files.length; i++) {
            newUploadsFileTypeArray.push(e.target.files[i]);
        }

        setFieldValue('post', allFileTypeUploads.concat(newUploadsFileTypeArray));

        const uploaded = e.target.files;
        let allUploaded = [];
        for(let i = 0; i < uploaded.length; i++) { 
            let newObject: any = {
                src: await videoCropHelpers.readFileAsBase64(uploaded[i]),
                srcBlob: URL.createObjectURL(uploaded[i]),
                name: uploaded[i].name,
                type: uploaded[i].type,
                size: uploaded[i].size,
                crop: {x: 0, y: 0},
                zoom: 1,
                customFilter: {},
                filterName: '',
                dataUrl: '',
                aspect: uploads[currentIndex].aspect
            }

            if(!(['video/mp4'].includes(uploaded[i].type))) {
                newObject.filterName = 'normal';
                newObject.customFilter.contrast = 100;
                newObject.customFilter.brightness = 100;
                newObject.customFilter.saturate = 100;
                newObject.customFilter.sepia = 0;
                newObject.customFilter.grayScale = 0;
            }else {
                newObject.rStart = 0;
                newObject.rEnd = 10;
            }

            allUploaded.push(newObject);
        }

        setUploads(uploads.concat(allUploaded));
    }

    return (
        <div className="flex flex-col h-full w-[704px]">
            <div className="flex justify-between px-4 border-b border-grey">
                <button type="button" onClick={() => {handleGoToPreviousForm('cropForm')}}>
                    <svg aria-label="Back" className="x1lliihq x1n2onr6 text-neutral-700" color="rgb(245, 245, 245)" fill="rgb(245, 245, 245)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Back</title><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="2.909" x2="22.001" y1="12.004" y2="12.004"></line><polyline fill="none" points="9.276 4.726 2.001 12.004 9.276 19.274" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline></svg>
                </button>
                <h3 className="flex-none text-base font-medium leading-6 text-gray-900 pb-3 pt-3 text-center">Crop</h3>
                <button className='text-[14px] font-medium text-blue-400 flex items-center cursor-pointer hover:text-sky-950' type="button" onClick={() => {handleGoToNextForm('cropForm')}}>
                    Next
                </button>
            </div>
            <div className="flex-1 h-[736px] w-full relative bg-black">
                {!errors.post && (
                    <div className="h-full w-full">    
                        <div className="w-full h-full">
                            {
                                uploads[currentIndex].type === 'image/jpeg' || uploads[currentIndex].type === 'image/png' || uploads[currentIndex].type === 'image/jpg' || uploads[currentIndex].type === 'image/tiff' ?
                                <Cropper 
                                    style={{containerStyle: {backgroundColor: 'white'}, cropAreaStyle: {border: '0px', boxShadow: '0 0 0 9999em rgb(23, 23, 23)'}}} 
                                    ref={imgResultRef}
                                    image={uploads[currentIndex].src} 
                                    crop={cropped}
                                    zoom={zoomed} 
                                    aspect={aspect}
                                    onCropChange={(crop: any) => handleCropChange(crop)}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={(zoom: any) => handleZoomChange(zoom)}
                                    objectFit="horizontal-cover"
                                    showGrid={showGrid}
                                    onInteractionStart={() => {
                                        // IF USER DRAG THE IMAGE THE GRID WILL SHOW
                                        setShowGrid(true);
                                    }}
                                    onInteractionEnd={() => {
                                        // IF USER STOP DRAGGING THE IMAGE THE GRID WILL NOT BE SHOW
                                        setShowGrid(false);
                                    }}
                                /> :
                                <Cropper 
                                    style={{containerStyle: {backgroundColor: 'white'}, cropAreaStyle: {border: '0px', boxShadow: '0 0 0 9999em rgb(23, 23, 23)'}}} 
                                    video={uploads[currentIndex].src} 
                                    crop={cropped}
                                    zoom={zoomed} 
                                    aspect={aspect}
                                    onCropChange={(crop: any) => handleCropChange(crop)}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={(zoom: any) => handleZoomChange(zoom)}
                                    objectFit="horizontal-cover"
                                    showGrid={showGrid}
                                    onInteractionStart={() => {
                                        // IF USER DRAG THE IMAGE THE GRID WILL SHOW
                                        setShowGrid(true);
                                    }}
                                    onInteractionEnd={() => {
                                        // IF USER STOP DRAGGING THE IMAGE THE GRID WILL NOT BE SHOW
                                        setShowGrid(false);
                                    }}
                                />
                            }
                            {
                                currentIndex !== 0 && 
                                <button type="button" onClick={() => {handleShowPreviousFile(currentIndex)}} className="absolute bottom-[50%] left-[10px] h-[30px] bg-neutral-900 w-[35px] h-[35px] flex items-center justify-center rounded-[50%]">
                                    <svg aria-label="Left chevron" className="_ab6- ml-[-3px]" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"><polyline fill="none" points="16.502 3 7.498 12 16.502 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline></svg>
                                </button>
                            }
                            {
                                !(currentIndex === uploads.length - 1) && 
                                <button type="button" onClick={() => {handleShowNextFile(currentIndex)}} className="absolute bottom-[50%] right-[10px] h-[30px] bg-neutral-900 w-[35px] h-[35px] flex items-center justify-center rounded-[50%]">
                                    <svg aria-label="Right chevron" className="_ab6- ml-[3px]" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"><polyline fill="none" points="8 3 17.004 12 8 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline></svg>
                                </button>
                            }

                            {
                                showRatioMenu && <div className="absolute bottom-[80px] left-[20px] bg-neutral-900 flex items-center justify-center flex flex-col rounded-lg bg-opacity-60">
                                    <button onClick={() => {handleUpdateAspect(1/1)}} type="button" className="w-[92.64px] h-[48px] flex gap-[15px] justify-center items-center">
                                        <span className={`${aspect === 1/1 ? `text-white` : `text-[#a8a8a8]`}`}>1:1</span>
                                        <svg aria-label="Crop square icon" className="_ab6-" color="rgb(168, 168, 168)" fill={`${aspect === 1/1 ? `rgb(255, 255, 255)` : `rgb(168, 168, 168)`}`} height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M19 23H5a4.004 4.004 0 0 1-4-4V5a4.004 4.004 0 0 1 4-4h14a4.004 4.004 0 0 1 4 4v14a4.004 4.004 0 0 1-4 4ZM5 3a2.002 2.002 0 0 0-2 2v14a2.002 2.002 0 0 0 2 2h14a2.002 2.002 0 0 0 2-2V5a2.002 2.002 0 0 0-2-2Z"></path></svg>
                                    </button>
                                     <button onClick={() => {handleUpdateAspect(4/5)}} type="button" className='w-[92.64px] h-[48px] flex gap-[15px] justify-center items-center border-y border-neutral-900'>
                                        <span className={`${aspect === 4/5 ? `text-white` : `text-[#a8a8a8]`}`}>4:5</span>
                                        <svg aria-label="Crop portrait icon" color="rgb(255, 255, 255)" fill={`${aspect === 4/5 ? `rgb(255, 255, 255)` : `rgb(168, 168, 168)`}`} height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M16 23H8a4.004 4.004 0 0 1-4-4V5a4.004 4.004 0 0 1 4-4h8a4.004 4.004 0 0 1 4 4v14a4.004 4.004 0 0 1-4 4ZM8 3a2.002 2.002 0 0 0-2 2v14a2.002 2.002 0 0 0 2 2h8a2.002 2.002 0 0 0 2-2V5a2.002 2.002 0 0 0-2-2Z"></path></svg>
                                    </button>
                                    <button onClick={() => {handleUpdateAspect(16/9)}} type="button" className='w-[92.64px] h-[48px] flex gap-[15px] justify-center items-center'>
                                        <span className={`${aspect === 16/9 ? `text-white` : `text-[#a8a8a8]`}`}>16:9</span>
                                        <svg aria-label="Crop landscape icon" color="rgb(115, 115, 115)" fill={`${aspect === 16/9 ? `rgb(255, 255, 255)` : `rgb(168, 168, 168)`}`} height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M19 20H5a4.004 4.004 0 0 1-4-4V8a4.004 4.004 0 0 1 4-4h14a4.004 4.004 0 0 1 4 4v8a4.004 4.004 0 0 1-4 4ZM5 6a2.002 2.002 0 0 0-2 2v8a2.002 2.002 0 0 0 2 2h14a2.002 2.002 0 0 0 2-2V8a2.002 2.002 0 0 0-2-2Z"></path></svg>
                                    </button>
                                </div>
                            }

                            {
                                <button type="button" onClick={() => {
                                    setShowZoomMenu(false);
                                    setShowUploadMenu(false);
                                    handleShowRatioMenu();
                                }} className="absolute bottom-[20px] left-[20px] h-[30px] bg-neutral-900 w-[35px] h-[35px] flex items-center justify-center rounded-[50%]">
                                    <svg aria-label="Select crop" className="_ab6-" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="M10 20H4v-6a1 1 0 0 0-2 0v7a1 1 0 0 0 1 1h7a1 1 0 0 0 0-2ZM20.999 2H14a1 1 0 0 0 0 2h5.999v6a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1Z"></path></svg>
                                </button>
                            }

                            {
                                showZoomMenu && <div className="h-[32px] p-2 absolute bottom-[80px] left-[60px] bg-neutral-900 flex items-center justify-center flex flex-col rounded-lg bg-opacity-60">
                                    <input type="range" onChange={(e) => {handleZoomChange(e.target.value)}} value={zoomed} step={0.005} min={1} max={3} className={`
                                        w-full 
                                        appearance-none 
                                        bg-red 
                                        [&::-webkit-slider-runnable-track]:bg-black
                                        [&::-webkit-slider-runnable-track]:h-[1px] 
                                        [&::-webkit-slider-thumb]:appearance-none  
                                        [&::-webkit-slider-thumb]:h-[15px]  
                                        [&::-webkit-slider-thumb]:w-[15px] 
                                        [&::-webkit-slider-thumb]:rounded-full  
                                        [&::-webkit-slider-thumb]:bg-white 
                                        [&::-webkit-slider-thumb]:mt-[-8px] thumb-center
                                    `}/>
                                </div>
                            }
                            {
                                <button type="button" onClick={() => {
                                    setShowRatioMenu(false);
                                    setShowUploadMenu(false);
                                    handleShowZoomMenu();
                                }} className="absolute bottom-[20px] left-[60px] h-[30px] bg-neutral-900 w-[35px] h-[35px] flex items-center justify-center rounded-[50%]">
                                    <svg aria-label="Select zoom" className="_ab6-" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="m22.707 21.293-4.825-4.825a9.519 9.519 0 1 0-1.414 1.414l4.825 4.825a1 1 0 0 0 1.414-1.414ZM10.5 18.001a7.5 7.5 0 1 1 7.5-7.5 7.509 7.509 0 0 1-7.5 7.5Zm3.5-8.5h-2.5v-2.5a1 1 0 1 0-2 0v2.5H7a1 1 0 1 0 0 2h2.5v2.5a1 1 0 0 0 2 0v-2.5H14a1 1 0 0 0 0-2Z"></path></svg>
                                </button>
                            }
                            {
                                showUploadMenu && <div className="p-2 absolute bottom-[80px] right-[20px] bg-neutral-900 flex justify-center flex gap-[10px] rounded-lg bg-opacity-60">
                                    {uploads.map((upload: any, index: number) => (
                                        <div key={index} className='relative'>
                                            {currentIndex !== index && <div className='w-full h-full bg-neutral-900 bg-opacity-50 absolute pointer-events-none'></div>}
                                            {upload.type === 'image/jpeg' || upload.type === 'image/png' || upload.type === 'image/jpg' || upload.type === 'image/tiff' ? 
                                                <Image onClick={() => {handleUpdateCurrentIndex(index)}} src={upload.src} alt="" width={50} height={50} className='w-[95px] h-[95px] object-cover'/>
                                                :
                                                <video onClick={() => {handleUpdateCurrentIndex(index)}} src={upload.src} width={50} height={50} className='w-[95px] h-[95px] object-cover'></video>
                                            }
                                            <div onClick={() => {handleRemoveUpload(index)}} className='absolute right-[5px] top-[5px] rounded-[50%] bg-neutral-900 bg-opacity-50 p-1'>
                                                <svg aria-label="Delete" className="_ab6-" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="12" role="img" viewBox="0 0 24 24" width="12"><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="21" y2="3"></line></svg>                                                
                                            </div>
                                        </div>
                                    ))}
                                    <label htmlFor="addNewUploads" className='w-[50px] h-[50px] flex items-center justify-center border rounded-[50%] border-neutral-900'>
                                        <svg aria-label="Plus icon" className="x1lliihq x1n2onr6" color="rgb(168, 168, 168)" fill="rgb(168, 168, 168)" height="22" role="img" viewBox="0 0 24 24" width="22"><title>Plus icon</title><path d="M21 11.3h-8.2V3c0-.4-.3-.8-.8-.8s-.8.4-.8.8v8.2H3c-.4 0-.8.3-.8.8s.3.8.8.8h8.2V21c0 .4.3.8.8.8s.8-.3.8-.8v-8.2H21c.4 0 .8-.3.8-.8s-.4-.7-.8-.7z"></path></svg>
                                    </label>
                                    <input type="file" id="addNewUploads" onChange={handleNewUploads} multiple className='hidden' accept="image/png, image/jpg, image/jpeg, image/tiff, video/mp4"/>
                                </div>
                            }
                            {
                                <button type="button" onClick={() => {
                                    setShowRatioMenu(false);
                                    setShowZoomMenu(false);
                                    handleShowUploadMenu();
                                }} className="absolute bottom-[20px] right-[20px] h-[30px] bg-neutral-900 w-[35px] h-[35px] flex items-center justify-center rounded-[50%]">
                                    <svg aria-label="Open media gallery" className="_ab6-" color="rgb(255, 255, 255)" fill="rgb(255, 255, 255)" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="M19 15V5a4.004 4.004 0 0 0-4-4H5a4.004 4.004 0 0 0-4 4v10a4.004 4.004 0 0 0 4 4h10a4.004 4.004 0 0 0 4-4ZM3 15V5a2.002 2.002 0 0 1 2-2h10a2.002 2.002 0 0 1 2 2v10a2.002 2.002 0 0 1-2 2H5a2.002 2.002 0 0 1-2-2Zm18.862-8.773A.501.501 0 0 0 21 6.57v8.431a6 6 0 0 1-6 6H6.58a.504.504 0 0 0-.35.863A3.944 3.944 0 0 0 9 23h6a8 8 0 0 0 8-8V9a3.95 3.95 0 0 0-1.138-2.773Z" fillRule="evenodd"></path></svg>
                                </button>
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CropForm;