'use client';

import "../../pages/globals.css";
import "../..//pages/instagram-filters.css";

import { Fragment, useState, useRef, useEffect } from "react";
import { Formik, Form } from "formik";
import { escape } from 'he';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';

import imageCropHelpers from "@/helpers/cropImage";
import * as videoCropHelpers from "@/helpers/cropVideo";

import Alert from "@/components/Alert";
import { useDropzone } from 'react-dropzone';
import { Dialog, Transition } from '@headlessui/react';

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

import UploadForm from "@/components/UploadForm";
import CropForm from "@/components/CropForm";
import EditForm from "@/components/EditForm";
import CaptionForm from "@/components/CaptionForm";

const FF = createFFmpeg({
    log: false,
    logger: () => {}, // console.log,
	progress: () => {}, // console.log,
    corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
});

const UploadComponent = ({setIsOpen, setFieldValue, errors, isDisabled, setIsDisabled, authenticatedUser}: any) => {
    let imgResultRef = useRef<any>(null);

    const [allFileTypeUploads, setAllFileTypeUploads] = useState<any>(null);

    const [showUploadsForm, showShowUploadsForm] = useState(true);
    const [showCropForm, setShowCropForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showCaptionForm, setShowCaptionForm] = useState(false);

    const [thumbNails, setThumbNails] = useState<any>([]);
    const [generatingThumbNails, setGeneratingThumbNails] = useState(false);

    const [rStart, setRStart] = useState(0);
    const [rEnd, setREnd] = useState(10);
    const [pStart, setPStart] = useState(10);

    const [videoMeta, setVideoMeta] = useState<any>({
        name: "",
        duration: 0,
        videoWidth: 0,
        videoHeight: 0
    });

    const [currentIndex, setCurrentIndex] = useState(0);

    const [uploads, setUploads] = useState<any>([{}]);
    const [croppedUploads, setCroppedUploads] = useState<any>([{}]);
    const [fullyEditedUploads, setFullyEditedUploads] = useState<any>([{}]);

    const [aspect, setAspect] = useState(1/1);

    const [cropped, setCropped] = useState<any>({x: 0, y: 0});
    const [zoomed, setZoomed] = useState<any>(1);

    const [filterName, setFilterName] = useState("");
    const [contrast, setContrast] = useState(100);
    const [brightness, setBrightness] = useState(100);
    const [saturate, setSaturate] = useState(100);
    const [sepia, setSepia] = useState(0);
    const [grayScale, setGrayScale] = useState(0);


    const [showRatioMenu, setShowRatioMenu] = useState(false);
    const [showZoomMenu, setShowZoomMenu] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
 

    const { getRootProps, getInputProps }: any = useDropzone({
        onDrop: async (uploaded) => {
            // * THIS WILL RUN THE VALIDATION SCHEME IF ALL UPLOADED ARE VALID TYPE AND VALID SIZE
            setAllFileTypeUploads(uploaded);
            setFieldValue("post", uploaded);
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
                    aspect: 1/1
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
                    newObject.pStart = 0;
                }

                allUploaded.push(newObject);
            }

            setCurrentIndex(0);
            setCropped(allUploaded[0].crop);
            setZoomed(allUploaded[0].zoom);
            setAspect(allUploaded[0].aspect);
            setUploads(allUploaded);
            showShowUploadsForm(false);
            setShowCropForm(true);
        }
    });

    const handleGoToPreviousForm = (form: string) => {
        if(form === 'cropForm') {
            setCurrentIndex(0);
            setUploads([{}]);
            showShowUploadsForm(true); // * DISPLAY THE UPLOADS FORM
            setShowCropForm(false); // * HIDE THE CROP FORM
        }

        if(form === 'editForm') {
            setCurrentIndex(0);
            setUploads(croppedUploads);
            setShowEditForm(false); // * HIDE THE EDIT FORM
            setShowCropForm(true); // * SHOW THE CROP FORM
        }

        if(form === 'captionForm') {
            setCurrentIndex(0);
            setUploads(fullyEditedUploads);
            setShowCaptionForm(false); // * SHOW THE CROP FORM
            setShowEditForm(true); // * HIDE THE EDIT FORM
        }
    }

    const handleGoToNextForm = async (form: string) => {
        if(form === 'cropForm') {
            setCurrentIndex(0);
            setCroppedUploads(uploads);
                
            let isAllUploadedCropped = true;

            for(let i = 0; i < uploads.length; i++) {
                if(uploads[i].croppedAreaPixels === undefined) {
                    isAllUploadedCropped = false;
                    i = uploads.length;
                    alert('Please make sure all images are cropped');
                } 
            }

            if(isAllUploadedCropped) {
                setFilterName(uploads[0].filterName);
                setContrast(uploads[0].customFilter.contrast);
                setBrightness(uploads[0].customFilter.brightness);
                setSaturate(uploads[0].customFilter.saturate);
                setSepia(uploads[0].customFilter.sepia);
                setGrayScale(uploads[0].customFilter.grayScale);

                setRStart(uploads[0].rStart);
                setREnd(uploads[0].rEnd);
                setPStart(uploads[0].pStart);

                const cropAllUploads = async () => {
                    try {
                        let allCroppedFiles = [];
        
                        for(let i = 0; i < uploads.length; i++) {
                            if(!(['video/mp4'].includes(uploads[i].type))) {
                                const croppedImage: any = await imageCropHelpers(
                                    uploads[i].src,
                                    uploads[i].croppedAreaPixels,
                                    0
                                )
                                allCroppedFiles.push({src: croppedImage, name: uploads[i].name, type: uploads[i].type, filterName: uploads[i].filterName, dataUrl: uploads[i].dataUrl, aspect: uploads[i].aspect, customFilter: {
                                    contrast: 100,
                                    brightness: 100,
                                    saturate: 100,
                                    sepia: 0,
                                    grayScale: 0
                                }});
                            }else if(['video/mp4'].includes(uploads[i].type)) {
                                try {
                                    allCroppedFiles.push(uploads[i]);
                                }catch (error) {
                                    console.log(error);
                                }
                            }
                        }

                        setUploads(allCroppedFiles);
                        setShowEditForm(true);
                        setShowCropForm(false);
                    } catch (error) {
                        console.log(error);
                    }
                }

                cropAllUploads();
            }
        }

        if(form === 'editForm') {
            setCurrentIndex(0);
            setFullyEditedUploads(uploads);

            for(let i = 0; i < uploads.length; i++) {
                if(!(['video/mp4'].includes(uploads[i].type))) {
                    if(uploads[i].dataUrl === '' && uploads[i].filterName === 'normal') {
                        let newUploads = uploads;
                        newUploads[i].dataUrl = uploads[i].src;
                        setUploads(newUploads);
                    }
                }
            }

            setShowEditForm(false);
            setShowCaptionForm(true);
        }
    }

    function handleShowPreviousFile(index: number) {
        if(showCropForm) {
            setCurrentIndex(index - 1);
            setCropped(uploads[index - 1].crop);
            setZoomed(uploads[index - 1].zoom);
            setAspect(uploads[index - 1].aspect);
        }

        if(showEditForm) {
            if(uploads[currentIndex - 1].type === 'image/jpeg' || uploads[currentIndex - 1].type === 'image/png' || uploads[currentIndex - 1].type === 'image/jpg' || uploads[currentIndex - 1].type === 'image/tiff') {
                setFilterName(uploads[currentIndex - 1].filterName);
                setContrast(uploads[currentIndex - 1].customFilter.contrast);
                setBrightness(uploads[currentIndex - 1].customFilter.brightness);
                setSaturate(uploads[currentIndex - 1].customFilter.saturate);
                setSepia(uploads[currentIndex - 1].customFilter.sepia);
                setGrayScale(uploads[currentIndex - 1].customFilter.grayScale);
            }

            if(uploads[currentIndex - 1].type === 'video/mp4') {
                setRStart(uploads[currentIndex - 1].rStart);
                setREnd(uploads[currentIndex - 1].rEnd);
                setPStart(uploads[currentIndex - 1].pStart);
            }

            setCurrentIndex(currentIndex - 1);
        }

        if(showCaptionForm) {
            if(uploads[currentIndex - 1].type === 'image/jpeg' || uploads[currentIndex - 1].type === 'image/png' || uploads[currentIndex - 1].type === 'image/jpg' || uploads[currentIndex - 1].type === 'image/tiff') {
                setFilterName(uploads[currentIndex - 1].filterName);
                setContrast(uploads[currentIndex - 1].customFilter.contrast);
                setBrightness(uploads[currentIndex - 1].customFilter.brightness);
                setSaturate(uploads[currentIndex - 1].customFilter.saturate);
                setSepia(uploads[currentIndex - 1].customFilter.sepia);
                setGrayScale(uploads[currentIndex - 1].customFilter.grayScale);
            }

            setCurrentIndex(currentIndex - 1);
        }
    }

    function handleShowNextFile(index: number) {
        if(showCropForm) {
            setCurrentIndex(index + 1);
            setCropped(uploads[index + 1].crop);
            setZoomed(uploads[index + 1].zoom);
            setAspect(uploads[index + 1].aspect);
        }

        if(showEditForm) {
            if(uploads[currentIndex + 1].type === 'image/jpeg' || uploads[currentIndex + 1].type === 'image/png' || uploads[currentIndex + 1].type === 'image/jpg' || uploads[currentIndex + 1].type === 'image/tiff') {
                setFilterName(uploads[currentIndex + 1].filterName);
                setContrast(uploads[currentIndex + 1].customFilter.contrast);
                setBrightness(uploads[currentIndex + 1].customFilter.brightness);
                setSaturate(uploads[currentIndex + 1].customFilter.saturate);
                setSepia(uploads[currentIndex + 1].customFilter.sepia);
                setGrayScale(uploads[currentIndex + 1].customFilter.grayScale);
            }

            if(uploads[currentIndex + 1].type === 'video/mp4') {
                setRStart(uploads[currentIndex + 1].rStart);
                setREnd(uploads[currentIndex + 1].rEnd);
                setPStart(uploads[currentIndex + 1].pStart);
            }

            setCurrentIndex(currentIndex + 1);
        }

        if(showCaptionForm) {
            if(uploads[currentIndex + 1].type === 'image/jpeg' || uploads[currentIndex + 1].type === 'image/png' || uploads[currentIndex + 1].type === 'image/jpg' || uploads[currentIndex + 1].type === 'image/tiff') {
                setFilterName(uploads[currentIndex + 1].filterName);
                setContrast(uploads[currentIndex + 1].customFilter.contrast);
                setBrightness(uploads[currentIndex + 1].customFilter.brightness);
                setSaturate(uploads[currentIndex + 1].customFilter.saturate);
                setSepia(uploads[currentIndex + 1].customFilter.sepia);
                setGrayScale(uploads[currentIndex + 1].customFilter.grayScale);
            }

            setCurrentIndex(currentIndex + 1);
        }
    }

    return (
        <>
            {errors.post && <Alert 
                title={"Error"} 
                message={errors.post} 
                callback={() => {setIsOpen(false);}}
            />}
            {showUploadsForm && <UploadForm 
                getRootProps={getRootProps} 
                getInputProps={getInputProps} 
                errors={errors}
            />}
            {showCropForm && <CropForm 
                uploads={uploads} 
                setUploads={setUploads}
                currentIndex={currentIndex} 
                setCurrentIndex={setCurrentIndex}
                errors={errors} 
                imgResultRef={imgResultRef} 
                cropped={cropped}
                zoomed={zoomed}
                setCropped={setCropped}
                setZoomed={setZoomed}
                handleShowPreviousFile={handleShowPreviousFile}
                handleShowNextFile={handleShowNextFile}
                handleGoToPreviousForm={handleGoToPreviousForm} 
                handleGoToNextForm={handleGoToNextForm}
                showRatioMenu={showRatioMenu}
                setShowRatioMenu={setShowRatioMenu}
                aspect={aspect}
                setAspect={setAspect}
                showZoomMenu={showZoomMenu}
                setShowZoomMenu={setShowZoomMenu}
                showUploadMenu={showUploadMenu}
                setShowUploadMenu={setShowUploadMenu}
                showShowUploadsForm={showShowUploadsForm}
                setShowCropForm={setShowCropForm}
                setFieldValue={setFieldValue}
                allFileTypeUploads={allFileTypeUploads}
                setAllFileTypeUploads={setAllFileTypeUploads}
            />
            }
            {showEditForm && <EditForm 
                uploads={uploads} 
                setUploads={setUploads}
                currentIndex={currentIndex} 
                imgResultRef={imgResultRef}
                handleShowPreviousFile={handleShowPreviousFile}
                handleShowNextFile={handleShowNextFile}
                handleGoToPreviousForm={handleGoToPreviousForm} 
                handleGoToNextForm={handleGoToNextForm}
                filterName={filterName}
                contrast={contrast}
                setContrast={setContrast}
                brightness={brightness}
                setBrightness={setBrightness}
                saturate={saturate}
                setSaturate={setSaturate}
                sepia={sepia}
                setSepia={setSepia}
                grayScale={grayScale}
                setGrayScale={setGrayScale}
                generatingThumbNails={generatingThumbNails}
                setGeneratingThumbNails={setGeneratingThumbNails}
                thumbNails={thumbNails}
                setThumbNails={setThumbNails}
                videoMeta={videoMeta}
                setVideoMeta={setVideoMeta}
                setFilterName={setFilterName}
                FF={FF}
                rStart={rStart}
                setRStart={setRStart}
                rEnd={rEnd}
                setREnd={setREnd}
                pStart={pStart}
                setPStart={setPStart}
                isDisabled={isDisabled}
                setIsDisabled={setIsDisabled}
            />}
            {showCaptionForm && <CaptionForm
                uploads={uploads}
                currentIndex={currentIndex}
                filterName={filterName}
                contrast={contrast}
                brightness={brightness}
                saturate={saturate}
                sepia={sepia}
                grayScale={grayScale}
                handleShowNextFile={handleShowNextFile}
                handleShowPreviousFile={handleShowPreviousFile}
                handleGoToPreviousForm={handleGoToPreviousForm}
                setFieldValue={setFieldValue}
                isDisabled={isDisabled}
                imgResultRef={imgResultRef}
                errors={errors}
                authenticatedUser={authenticatedUser}
            />}
        </>
    );
};

const CreatePost = ({authenticatedUser, currentSideNavActive, setCurrentSideNavActive}: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    function closeModal() {
        setIsOpen(false);
        
        if (window.location.pathname.includes(`/${authenticatedUser.username}`)) {
            setCurrentSideNavActive('Profile');
        } else if (window.location.pathname.includes(`/accounts/edit`)) {
            setCurrentSideNavActive('');
        } else if (window.location.pathname.includes(`/explore/tags`)) {
            setCurrentSideNavActive('');
        } else if (window.location.pathname.includes(`/explore`)) {
            setCurrentSideNavActive('Explore');
        } else if (window.location.pathname.includes(`/home`)) {
            setCurrentSideNavActive('Home');
        } else {
            setCurrentSideNavActive('');
        }
    }
    
    function openModal() {
        setIsOpen(true);
        setCurrentSideNavActive('Create');
    }

    const initialValues = {
        post: {},
        uploads: [],
        caption: "",
        alt_text: "",
    };

    const validationSchema = Yup.object().shape({
        post: Yup.mixed()
            .required("Images or videos is required")
            .test("TOTAL_FILES", "Maximum files upload only is 10.", 
                (values: any) => {
                    if(values.length > 10) {
                        return false;
                    }else {
                        return true;
                    }
                })
            .test("FILES_FORMAT", "All uploaded files must be supported format format.", 
                (values: any) => {
                    for(let i = 0; i < values.length; i++) {
                        let result: boolean = (values[i] && ['image/png', 'image/jpg', 'image/jpeg', 'image/bmp', 'image/tiff', 'video/mp4'].includes(values[i].type));
                    
                        if(result === false) {
                            i = values.length;
                            return false;
                        }
                    }

                    return true;
                })
            .test("FILES_SIZE", "Photo must not be exceed 10mb and video must not exceed 100mb.", 
                (values: any) => {
                    for(let i = 0; i < values.length; i++) {
                        if(values[i] && values[i].type === 'video/mp4') {
                            let result: boolean = (values[i] && values[i].size <= 100000000);

                            if(result === false) {
                                i = values.length;
                                return false;
                            }
                        }else {
                            let result: boolean = (values[i] && values[i].size <= 10000000);

                            if(result === false) {
                                i = values.length;
                                return false;
                            }
                        }
                    }

                    return true;
                }),
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

    const onSubmit = async (values: any) => {
        setIsDisabled(true);

        let uploadsFileTypeArray: any = [];
        let uploads = values.uploads;

        const cropAllUploads = async () => {
            try {
                for(let i = 0; i < uploads.length; i++) {
                    if(['video/mp4'].includes(uploads[i].type)) {
                        // THIS IS FOR VIDEO PROCESS EDITING. PREPARING TO SEND IN SERVER.
                        let startTime: any = ((uploads[i].rStart / 100) * uploads[i].meta.duration).toFixed(2);
                        let offset = ((uploads[i].rEnd / 100) * uploads[i].meta.duration - startTime).toFixed(2);

                        FF.FS("writeFile", uploads[i].name, await fetchFile(uploads[i].src));

                        // IF THERE IS NO UPLOADED POSTER FILE AND THE USER NOT SELECTED POSTER
                        if(!(uploads[i].hasOwnProperty('poster')) && uploads[i].pStart !== 0) {
                            // CREATE POSTER
                            await FF.run(
                                "-ss",
                                videoCropHelpers.toTimeString(Number(uploads[i].pStart)),
                                "-i",
                                uploads[i].name,
                                "-t",
                                videoCropHelpers.toTimeString(Number(uploads[i].pStart)),
                                "-filter:v",
                                `crop=${uploads[i].croppedAreaPixels.width}:${uploads[i].croppedAreaPixels.height}:${uploads[i].croppedAreaPixels.x}:${uploads[i].croppedAreaPixels.y}`,
                                "-c:a",
                                "copy",
                                "img.png"
                            );
            
                            const posterImage = FF.FS("readFile", `img.png`);
                            let posterImageBlob = new Blob([posterImage.buffer], { type: "image/png" });
                            let posterImageFile = videoCropHelpers.blobToFile(posterImageBlob, uploads[i].name);
                            // END CREATE POSTER

                            // TRIM VIDEO
                            await FF.run(
                                "-ss",
                                videoCropHelpers.toTimeString(startTime),
                                "-i", 
                                uploads[i].name, 
                                "-t",
                                videoCropHelpers.toTimeString(offset),
                                "-filter:v",
                                `crop=${uploads[i].croppedAreaPixels.width}:${uploads[i].croppedAreaPixels.height}:${uploads[i].croppedAreaPixels.x}:${uploads[i].croppedAreaPixels.y}`,
                                "-c:a",
                                "copy",
                                "outputVideo.mp4"
                            );
    
                            const croppedVideo = FF.FS("readFile", "outputVideo.mp4");
                            const finalVideoBlob = new Blob([croppedVideo.buffer], { type: "video/mp4" });
                            const finalVideoFile = videoCropHelpers.blobToFile(finalVideoBlob, uploads[i].name);
                            
                            const data: any = {
                                file: finalVideoFile,
                                type: "video/mp4"
                            }
    
                            if(uploads[i].hasOwnProperty('poster')) {
                                data.poster = uploads[i].poster
                            }else {
                                data.poster = posterImageFile
                            }
    
                            uploadsFileTypeArray.push(data);
                            // END TRIM VIDEO
                        }else {
                            // TRIM VIDEO
                            await FF.run(
                                "-ss",
                                videoCropHelpers.toTimeString(startTime),
                                "-i", 
                                uploads[i].name, 
                                "-t",
                                videoCropHelpers.toTimeString(offset),
                                "-filter:v",
                                `crop=${uploads[i].croppedAreaPixels.width}:${uploads[i].croppedAreaPixels.height}:${uploads[i].croppedAreaPixels.x}:${uploads[i].croppedAreaPixels.y}`,
                                "-c:a",
                                "copy",
                                "outputVideo.mp4"
                            );
    
                            const croppedVideo = FF.FS("readFile", "outputVideo.mp4");
                            const finalVideoBlob = new Blob([croppedVideo.buffer], { type: "video/mp4" });
                            const finalVideoFile = videoCropHelpers.blobToFile(finalVideoBlob, uploads[i].name);
                            
                            const data: any = {
                                file: finalVideoFile,
                                type: "video/mp4"
                            }
    
                            if(uploads[i].hasOwnProperty('poster')) {
                                data.poster = uploads[i].poster
                            }
    
                            uploadsFileTypeArray.push(data);
                            // END TRIM VIDEO
                        }
                    }else {
                        // THIS IS FOR IMAGE ONLY CONVERTING DATAURL TO FILE. PREPARING TO SEND IN SERVER
                        const response = await fetch(uploads[i].dataUrl);
                        const blob = await response.blob(); 
                        const file = new File([blob], uploads[i].name, {
                              type: uploads[i].type
                            }
                        );

                        const data = {
                            file: file,
                            type: uploads[i].type
                        }

                        uploadsFileTypeArray.push(data);
                    }
                }

                const sanitizedLoginCaption = DOMPurify.sanitize(values.caption);
                const sanitizedLoginAltText = DOMPurify.sanitize(values.alt_text);

                const formData = new FormData();

                for (let i = 0; i < uploadsFileTypeArray.length; i++) {
                    formData.append(i.toString(), uploadsFileTypeArray[i].file);
                    if(uploadsFileTypeArray[i].hasOwnProperty('poster')) {
                        formData.append(i.toString(), uploadsFileTypeArray[i].poster);
                    }
                }

                formData.append('caption', sanitizedLoginCaption); // Use the 'post' variable instead of an empty object
                formData.append('alt_text', sanitizedLoginAltText); // Use the 'post' variable instead of an empty object

                try {
                    const settings: object = {
                        method: 'POST',
                        credentials: 'include',
                        body: formData
                    }

                    const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/post`, settings);
                    const result = await response.json();

                    if(result.status === 'ok') {
                        alert('success');
                    }else {
                        alert('failed');
                    }

                    setIsDisabled(false);
                    closeModal();
                }catch(error) {
                    alert(error);
                }
            } catch (error) {
                console.log(error);
            }
        }

        cropAllUploads();
    };

    useEffect(() => {
        const loadFFmpeg = async () => {
            if(!(FF.isLoaded)) {
                await FF.load();
                console.log("FFmpeg is ready!");
            }
        };

        loadFFmpeg();
    }, []);

    return (
        <div>
            <div onClick={() => {openModal();}} className="flex bg-transparent border-0 my-[4px] p-[12px] hover:cursor-pointer duration-[200ms] hover:bg-neutral-200 rounded-md">
                {currentSideNavActive === 'Create' ? 
                    <svg aria-label="New post" className="_ab6-" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="m12.003 5.545-.117.006-.112.02a1 1 0 0 0-.764.857l-.007.117V11H6.544l-.116.007a1 1 0 0 0-.877.876L5.545 12l.007.117a1 1 0 0 0 .877.876l.116.007h4.457l.001 4.454.007.116a1 1 0 0 0 .876.877l.117.007.117-.007a1 1 0 0 0 .876-.877l.007-.116V13h4.452l.116-.007a1 1 0 0 0 .877-.876l.007-.117-.007-.117a1 1 0 0 0-.877-.876L17.455 11h-4.453l.001-4.455-.007-.117a1 1 0 0 0-.876-.877ZM8.552.999h6.896c2.754 0 4.285.579 5.664 1.912 1.255 1.297 1.838 2.758 1.885 5.302L23 8.55v6.898c0 2.755-.578 4.286-1.912 5.664-1.298 1.255-2.759 1.838-5.302 1.885l-.338.003H8.552c-2.754 0-4.285-.579-5.664-1.912-1.255-1.297-1.839-2.758-1.885-5.302L1 15.45V8.551c0-2.754.579-4.286 1.912-5.664C4.21 1.633 5.67 1.05 8.214 1.002L8.552 1Z"></path></svg>
                    : 
                    <svg aria-label="New post" className="_ab6-" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M2 12v3.45c0 2.849.698 4.005 1.606 4.944.94.909 2.098 1.608 4.946 1.608h6.896c2.848 0 4.006-.7 4.946-1.608C21.302 19.455 22 18.3 22 15.45V8.552c0-2.849-.698-4.006-1.606-4.945C19.454 2.7 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.547 2 5.703 2 8.552Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="6.545" x2="17.455" y1="12.001" y2="12.001"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="12.003" x2="12.003" y1="6.545" y2="17.455"></line></svg>
                }
                {
                    currentSideNavActive === 'Create' ?
                    <h2 data-type-sidenav-text className={`pl-[16px] max-md:hidden font-bold pointer-events-none`}>Create</h2>
                    :
                    currentSideNavActive === 'Search' ?
                    <h2 data-type-sidenav-text className={`pl-[16px] max-md:hidden hidden pointer-events-none`}>Create</h2>
                    :
                    <h2 data-type-sidenav-text className={`pl-[16px] max-md:hidden pointer-events-none`}>Create</h2>
                }
            </div>

            <Transition appear show={isOpen} as={Fragment}>
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
                        <div className="flex min-h-full items-center justify-center text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-100"
                                enterFrom="opacity-0 scale-[1.05]"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-100"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-[1.05]"
                            >
                                <Dialog.Panel className="h-[753px] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                    <Formik className="w-[704px] h-full" validationSchema={validationSchema} initialValues={initialValues} onSubmit={onSubmit}>
                                        {({ setFieldValue, errors }) => (
                                            <Form className="h-full w-full" encType="multipart/form-data">
                                                <div className="flex h-full w-full justify-center flex-col items-center">
                                                    <UploadComponent setIsOpen={setIsOpen} setFieldValue={setFieldValue} errors={errors} authenticatedUser={authenticatedUser} isDisabled={isDisabled} setIsDisabled={setIsDisabled}/>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}

export default CreatePost;