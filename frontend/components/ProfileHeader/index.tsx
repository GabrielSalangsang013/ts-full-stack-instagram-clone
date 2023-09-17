import Link from "next/link";

import { useEffect, useState } from "react";
import ModalShowFollowing from "@/components/ModalShowFollowing";
import ModalShowFollowers from "@/components/ModalShowFollowers";
import { Form, Formik } from "formik";
import * as Yup from 'yup';
import Alert from "@/components/Alert";
import replaceMentionsAndHashtagsWithLinks from "@/helpers/replaceMentionsAndHashtagsWithLinks";
import OptimizeImage from "@/helpers/optimizedImage";
import Image from "next/image";

const ProfileHeader = ({
    userProfile, 
    isOwned, 
    isAuthenticatedUserFollowThisProfile, 
    authenticatedUserFollowingWhoFollowingThisProfile
}: any) => {

    const [showModalFollowing, setShowModalFollowing] = useState<boolean>(false);
    const [showModalFollowers, setShowModalFollowers] = useState<boolean>(false);
    const [totalFollowers, setTotalFollowers] = useState<number>(userProfile.profile.followers.length);
    const [totalFollowing, setTotalFollowing] = useState<number>(userProfile.following.length);
    
    const initialValuesUpdateProfilePicture = {
        post: []
    };

    useEffect(() => {
        setTotalFollowers(userProfile.profile.followers.length);
        setTotalFollowing(userProfile.following.length);
    }, [userProfile, userProfile._id]);

    const handleFollow = async (profile_id: string) => {
        try {
            const settings: object = {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    profile_id: profile_id
                })
            }

            const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/follow`, settings);
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

    const handleUnfollow = async (profile_id: string) => {
        try {
            const settings: object = {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    profile_id: profile_id
                })
            }

            const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/unfollow`, settings);
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

    const validationSchemaUpdateProfilePicture = Yup.object().shape({
        post: Yup.mixed()
            .required("Image required")
            .test("TOTAL_FILES", "Maximum files upload only is 1.", 
                (values: any) => {
                    if(values.length > 1) {
                        return false;
                    }else {
                        return true;
                    }
                })
            .test("FILES_FORMAT", "All uploaded files must be supported format format.", 
                (values: any) => {
                    let result: boolean = (values[0] && ['image/png', 'image/jpg', 'image/jpeg', 'image/bmp', 'image/tiff'].includes(values[0].type));
                    return result;
                })
            .test("FILES_SIZE", "Photo must not be exceed 10mb.", 
                (values: any) => {
                    let result: boolean = (values[0] && values[0].size <= 10000000);
                    return result;
                })
    });

    const handleSubmitSetNewProfilePicture = async (values: any) => {
        const formData = new FormData();

        formData.append('newProfilePicture', values.post[0])

        try {
            const settings: object = {
                method: 'PUT',
                credentials: 'include',
                body: formData
            }

            const response = await fetch(`${process.env.REACT_APP_API}/api/v1/instagram/user/profile_picture`, settings);
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
            <ModalShowFollowing username={userProfile.username} showModalFollowing={showModalFollowing} setShowModalFollowing={setShowModalFollowing} isOwned={isOwned} totalFollowing={totalFollowing} setTotalFollowing={setTotalFollowing}/>
            <ModalShowFollowers profile_id={userProfile.profile._id} showModalFollowers={showModalFollowers} setShowModalFollowers={setShowModalFollowers} isOwned={isOwned} totalFollowers={totalFollowers} setTotalFollowers={setTotalFollowers}/>
            
            <header className="flex mb-16">
                <div className="max-w-[300px] w-full flex items-center flex-col">
                    <div className="w-[150px] h-[150px] relative">
                        {
                            isOwned && <label htmlFor="uploadNewProfilePictureInput" className="w-full h-full absolute cursor-pointer"></label>
                        }
                        <Image priority width={250} height={250} className="w-full h-full object-cover rounded-[50%]" crossOrigin="anonymous" src={OptimizeImage(userProfile.profile.profilePicture, ['w_250', 'h_250', 'c_fill'])} alt="" />
                    </div>
                    {
                        isOwned &&
                        <Formik validationSchema={validationSchemaUpdateProfilePicture} initialValues={initialValuesUpdateProfilePicture} onSubmit={handleSubmitSetNewProfilePicture}>
                            {({ setFieldValue, errors, submitForm, }) => (
                                <>
                                    {errors.post && <Alert 
                                            title={"Error"} 
                                            message={errors.post} 
                                            callback={() => {}}
                                        />
                                    }
                                    
                                    <Form className="h-full w-full" encType="multipart/form-data">
                                        <div className="flex h-full w-full justify-center flex-col items-center">
                                            <input type="file" id="uploadNewProfilePictureInput" className="hidden" onChange={async (e: any) => {
                                                const selectedFile = e.target.files;
                                                setFieldValue("post", selectedFile);

                                                try {
                                                    await validationSchemaUpdateProfilePicture.validate(
                                                        { post: selectedFile },
                                                        { abortEarly: false }
                                                    );
                                                    
                                                    submitForm(); 
                                                } catch (errors) {
                                                    
                                                }
                                            }}/>
                                        </div>
                                    </Form>
                                </>
                            )}
                        </Formik>
                    }
                </div>
                <div className="flex-1 grow-[2] flex flex-col">
                    <div className="flex mb-5 flex-wrap gap-2">
                        <h1 className="text-[20px]">{userProfile.username}</h1>
                        {isOwned ? 
                        <>
                            <Link href="/accounts/edit">
                                <button type="button" className="ml-[20px] px-[16px] h-[32px] py-1 font-semibold bg-neutral-100 hover:bg-neutral-300 rounded-md text-[14px]">Edit profile</button>
                            </Link>
                            <Link href="/">
                                <button type="button" className="ml-[10px] px-[16px] h-[32px] py-1 font-semibold bg-neutral-100 hover:bg-neutral-300 rounded-md text-[14px]">View archive</button>
                            </Link>
                            <button type="button" className="px-2">
                                <svg aria-label="Options" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Options</title><circle cx="12" cy="12" fill="none" r="8.635" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle><path d="M14.232 3.656a1.269 1.269 0 0 1-.796-.66L12.93 2h-1.86l-.505.996a1.269 1.269 0 0 1-.796.66m-.001 16.688a1.269 1.269 0 0 1 .796.66l.505.996h1.862l.505-.996a1.269 1.269 0 0 1 .796-.66M3.656 9.768a1.269 1.269 0 0 1-.66.796L2 11.07v1.862l.996.505a1.269 1.269 0 0 1 .66.796m16.688-.001a1.269 1.269 0 0 1 .66-.796L22 12.93v-1.86l-.996-.505a1.269 1.269 0 0 1-.66-.796M7.678 4.522a1.269 1.269 0 0 1-1.03.096l-1.06-.348L4.27 5.587l.348 1.062a1.269 1.269 0 0 1-.096 1.03m11.8 11.799a1.269 1.269 0 0 1 1.03-.096l1.06.348 1.318-1.317-.348-1.062a1.269 1.269 0 0 1 .096-1.03m-14.956.001a1.269 1.269 0 0 1 .096 1.03l-.348 1.06 1.317 1.318 1.062-.348a1.269 1.269 0 0 1 1.03.096m11.799-11.8a1.269 1.269 0 0 1-.096-1.03l.348-1.06-1.317-1.318-1.062.348a1.269 1.269 0 0 1-1.03-.096" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>
                            </button>
                        </> 
                        : 
                        <>
                            {
                                isAuthenticatedUserFollowThisProfile ? 
                                <button type="button" onClick={() => {handleUnfollow(userProfile.profile._id);}} className="ml-[20px] px-[16px] h-[32px] py-1 font-semibold bg-neutral-100 hover:bg-neutral-300 rounded-md text-[14px]">
                                    Unfollow
                                </button>
                                :
                                <button type="button" onClick={() => {handleFollow(userProfile.profile._id);}} className="ml-[20px] px-[16px] h-[32px] py-1 font-semibold bg-neutral-100 hover:bg-neutral-300 rounded-md text-[14px]">
                                    Follow
                                </button>
                            }
                        </>}
                    </div>
                    <div className="flex mb-3">
                        <span className="mr-8"><span className="font-medium">{userProfile.profile.posts.length}</span> post</span>
                        <span className="mr-8 cursor-pointer" onClick={() => {setShowModalFollowers(true);}}><span className="font-medium">{totalFollowers}</span> followers</span>
                        <span className="mr-8 cursor-pointer" onClick={() => {setShowModalFollowing(true);}}><span className="font-medium">{totalFollowing}</span> following</span>
                    </div>
                    <div className="mb-3">
                        <span className="font-medium text-[14px] block">{userProfile.profile.fullName}</span>
                        {
                            userProfile.profile.hasOwnProperty('bio') && userProfile.profile.bio !== '' ?
                            <span className="text-[14px] block whitespace-pre-line" dangerouslySetInnerHTML={replaceMentionsAndHashtagsWithLinks(userProfile.profile.bio)}></span>
                            : <></>
                        }
                        {
                            userProfile.profile.hasOwnProperty('link') && userProfile.profile.link !== ''  ?
                            <div className="flex items-center gap-2">
                                <svg aria-label="Link icon" color="rgb(0, 55, 107)" fill="rgb(0, 55, 107)" height="12" role="img" viewBox="0 0 24 24" width="12"><title>Link icon</title><path d="m9.726 5.123 1.228-1.228a6.47 6.47 0 0 1 9.15 9.152l-1.227 1.227m-4.603 4.603-1.228 1.228a6.47 6.47 0 0 1-9.15-9.152l1.227-1.227" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="8.471" x2="15.529" y1="15.529" y2="8.471"></line></svg>
                                <Link href={`${userProfile.profile.link}`}><span className="text-[14px] text-sky-950 font-medium hover:underline">{userProfile.profile.link}</span></Link>
                            </div>
                            : <></>
                        }
                    </div>
                    {
                        authenticatedUserFollowingWhoFollowingThisProfile.length > 0 &&
                        <div>
                            <span className="text-[12px] font-semibold text-neutral-500">Followed by </span>
                            {
                                authenticatedUserFollowingWhoFollowingThisProfile.length === 1 ?
                                <>
                                    <span className="text-[12px] font-semibold"><Link href={`/${authenticatedUserFollowingWhoFollowingThisProfile[0].username}`}>{authenticatedUserFollowingWhoFollowingThisProfile[0].username}</Link> </span>
                                </> :
                                authenticatedUserFollowingWhoFollowingThisProfile.length === 2 ?
                                <>
                                    <span className="text-[12px] font-semibold"><Link href={`/${authenticatedUserFollowingWhoFollowingThisProfile[0].username}`}>{authenticatedUserFollowingWhoFollowingThisProfile[0].username}</Link></span>
                                    <span className="text-[12px] font-semibold">, </span>
                                    <span className="text-[12px] font-semibold"><Link href={`/${authenticatedUserFollowingWhoFollowingThisProfile[1].username}`}>{authenticatedUserFollowingWhoFollowingThisProfile[1].username}</Link></span>
                                </> :
                                authenticatedUserFollowingWhoFollowingThisProfile.length === 3 ?
                                <>
                                    <span className="text-[12px] font-semibold"><Link href={`/${authenticatedUserFollowingWhoFollowingThisProfile[0].username}`}>{authenticatedUserFollowingWhoFollowingThisProfile[0].username}</Link></span>
                                    <span className="text-[12px] font-semibold">, </span>
                                    <span className="text-[12px] font-semibold"><Link href={`/${authenticatedUserFollowingWhoFollowingThisProfile[1].username}`}>{authenticatedUserFollowingWhoFollowingThisProfile[1].username}</Link></span>
                                    <span className="text-[12px] font-semibold">, </span>
                                    <span className="text-[12px] font-semibold"><Link href={`/${authenticatedUserFollowingWhoFollowingThisProfile[2].username}`}>{authenticatedUserFollowingWhoFollowingThisProfile[2].username}</Link></span>
                                </> :
                                <>
                                    <span className="text-[12px] font-semibold"><Link href={`/${authenticatedUserFollowingWhoFollowingThisProfile[0].username}`}>{authenticatedUserFollowingWhoFollowingThisProfile[0].username}</Link></span>
                                    <span className="text-[12px] font-semibold">, </span>
                                    <span className="text-[12px] font-semibold"><Link href={`/${authenticatedUserFollowingWhoFollowingThisProfile[1].username}`}>{authenticatedUserFollowingWhoFollowingThisProfile[1].username}</Link></span>
                                    <span className="text-[12px] font-semibold">, </span>
                                    <span className="text-[12px] font-semibold"><Link href={`/${authenticatedUserFollowingWhoFollowingThisProfile[2].username}`}>{authenticatedUserFollowingWhoFollowingThisProfile[2].username}</Link></span>
                                    <span className="text-[12px] font-semibold text-neutral-500"> + </span>
                                    <span className="text-[12px] font-semibold text-neutral-500">{authenticatedUserFollowingWhoFollowingThisProfile.length - 3} more</span>
                                </>
                            }
                        </div>
                    }
                </div>
            </header>
        </>
    )
}

export default ProfileHeader;