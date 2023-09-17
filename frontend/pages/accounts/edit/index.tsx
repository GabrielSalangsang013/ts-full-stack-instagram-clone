import Head from "next/head";
import SideNav from "@/components/SideNav";
import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";

import { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from 'yup';
import Alert from "@/components/Alert";
import { escape } from 'he';
import DOMPurify from "dompurify";
import OptimizeImage from "@/helpers/optimizedImage";
import PrivateRoutes from "@/components/PrivateRoutes";
import { useRouter } from "next/router";

const UpdateProfile = ({authenticatedUser}: any) => {
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const initialValuesUpdateProfilePicture = {
        post: []
    };

    const initialValuesUpdateProfile = {
        fullName: '',
        username: '',
        link: '',
        bio: ''
    }

    const validationSchemaUpdateProfile = Yup.object().shape({
        fullName: Yup.string()
            .required('Full Name is required')
            .trim()
            .max(50, 'Full Name must not exceed 50 characters')
            .matches(/^[A-Za-z.\s]+$/, 'Full Name must contain letters and dots only')
            .test(
              'full-name-xss-nosql',
              'Full Name contains potentially unsafe characters or invalid characters',
              (value) => {
                    const sanitizedValue = escape(value);
                    return sanitizedValue === value; // Check if sanitized value is the same as the original value
              }
            ),
        username: Yup.string()
            .required('Username is required')
            .trim()
            .min(4, 'Username must be at least 4 characters')
            .max(20, 'Username must not exceed 20 characters')
            .matches(/^[a-zA-Z0-9]+$/, 'Username can only contain letters, numbers, and underscores')
            .test(
                'username-security',
                'Username should not contain sensitive information',
                (value) => !/\b(admin|root|superuser)\b/i.test(value)
            )
            .test(
                'username-xss-nosql',
                'Invalid characters detected',
                (value) => {
                    const sanitizedValue = escape(value);
                    return sanitizedValue === value; // Check if sanitized value is the same as the original value
                }
            ),
        link: Yup.string()
            .trim()
            .matches(
              /^([a-zA-Z]+:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:(\d+))?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i,
              'Link must be a valid link'
            ),
        bio: Yup.string()
            .optional()
            .max(150, 'Bio must not exceed 150 characters')
            .test({
                name: 'bio-xss-nosql',
                message: 'Invalid characters detected',
                test: (value: any) => {
                  if(value === undefined || '') {
                    return true;
                  }else {
                    const sanitizedValue = escape(value);
                    return sanitizedValue === value;
                  }
                },
            }),
    });

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

    const handleSubmitUpdateProfile = async (values: any) => {
        const {fullName, username, link, bio} = values;

        const sanitizedFullName = DOMPurify.sanitize(fullName);
        const sanitizedUsername = DOMPurify.sanitize(username);
        const sanitizedLink = DOMPurify.sanitize(link);
        const sanitizedBio = DOMPurify.sanitize(bio);

        setIsDisabled(true);

        fetch(`${process.env.REACT_APP_API}/api/v1/instagram/user/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                fullName: sanitizedFullName,
                username: sanitizedUsername,
                link: sanitizedLink,
                bio: sanitizedBio,
            })
        })
        .then((response) => response.json())
        .then((result) => {
            if(result.status === 'ok') {
                setIsDisabled(false);
                alert('sucess');
            }
        })
        .catch((error) => {
            setIsDisabled(false);
            alert(error);
        });
    }

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
            <Head>
                <title>Edit profile | Instagram</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/instagram_icon.ico" />
            </Head>

            <Layout>
                <SideNav authenticatedUser={authenticatedUser} sideNavActive={''}/>
                <div className="flex-1 py-8 flex">
                    <div className="w-[315px] border-r border-r-neutral-200 flex flex-col">
                        <div className="mr-[48px] ml-[36px] mb-[24px] px-[16px]">
                            <h1 className="text-[20px] font-bold">Settings</h1>
                        </div>
                        <div className="mr-[48px] ml-[36px] bg-neutral-100 hover:bg-neutral-200 rounded-[8px]">
                            <button className="p-[16px] w-full text-left text-[14px]" type="button">
                                Edit profile
                            </button>
                        </div>  
                        <div className="mr-[48px] ml-[36px] hover:bg-neutral-200 rounded-[8px]">
                            <Link href="/accounts/password/change">
                                <button className="p-[16px] w-full text-left text-[14px]" type="button">
                                    Change Password
                                </button>
                            </Link>
                        </div>  
                    </div>
                    <div className="flex-1 flex flex-col">
                        <div className="w-full mt-[32px] flex items-center">
                            <div className="ml-[124px] mr-[32px]">
                                <Image width={64} height={64} crossOrigin="anonymous" src={OptimizeImage(authenticatedUser.profile.profilePicture, ['w_64', 'h_64', 'c_fill'])} alt={authenticatedUser.username + ' profile picture'} className="w-[38px] h-[38px] object-cover rounded-[50%] border border-neutral-200" />
                            </div>
                            <div className="flex-1 flex flex-col leading-[17px]">
                                <span className="">{authenticatedUser.username}</span>
                                <div>
                                    <label htmlFor="updateProfilePictureInput" className="text-sky-500 text-[14px] font-medium cursor-pointer hover:text-sky-800 inline-block w-auto">Change profile photo</label>
                                </div>
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
                                                    <input type="file" id="updateProfilePictureInput" className="hidden" onChange={async (e: any) => {
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
                            </div>
                        </div>

                        <Formik validationSchema={validationSchemaUpdateProfile} initialValues={initialValuesUpdateProfile} onSubmit={handleSubmitUpdateProfile}>
                            <Form>
                                <div className="w-full mt-[24px] flex">
                                    <div className="basis-[194px] text-right px-[32px] pt-1">
                                        <span className="font-semibold">Name</span>
                                    </div>
                                    <div className="flex flex-col leading-[17px] w-[355px]">
                                        <Field disabled={isDisabled} className={`w-full px-[10px] h-[32px] border border-neutral-200 rounded-sm focus:outline-0 ${isDisabled && `opacity-50`}`} type="text" id="fullName" name="fullName"/>
                                        <ErrorMessage name="fullName" component="div" className="text-left w-full flex justify-left text-[14px] mb-3 text-red-600"/>  
                                    </div>
                                </div>

                                <div className="w-full mt-[24px] flex">
                                    <div className="basis-[194px] text-right px-[32px] pt-1">
                                        <span className="font-semibold">Username</span>
                                    </div>
                                    <div className="flex flex-col leading-[17px] w-[355px]">
                                        <Field disabled={isDisabled} className={`w-full px-[10px] h-[32px] border border-neutral-200 rounded-sm focus:outline-0 ${isDisabled && `opacity-50`}`} type="text" id="username" name="username"/>
                                        <ErrorMessage name="username" component="div" className="text-left w-full flex justify-left text-[14px] mb-3 text-red-600"/>  
                                    </div>
                                </div>

                                <div className="w-full mt-[24px] flex">
                                    <div className="basis-[194px] text-right px-[32px] pt-1">
                                        <span className="font-semibold">Website</span>
                                    </div>
                                    <div className="flex flex-col leading-[17px] w-[355px]">
                                        <Field disabled={isDisabled} className={`w-full px-[10px] h-[32px] border border-neutral-200 rounded-sm focus:outline-0 ${isDisabled && `opacity-50`}`} type="text" id="link" name="link"/>
                                        <ErrorMessage name="link" component="div" className="text-left w-full flex justify-left text-[14px] mb-3 text-red-600"/>
                                    </div>
                                </div>

                                <div className="w-full mt-[24px] flex">
                                    <div className="basis-[194px] text-right px-[32px] pt-1">
                                        <span className="font-semibold">Bio</span>
                                    </div>
                                    <div className="flex flex-col leading-[17px] w-[355px]">
                                        <Field as="textarea" rows={6} disabled={isDisabled} className={`w-full px-[10px] py-2 border border-neutral-200 rounded-sm focus:outline-0 ${isDisabled && `opacity-50`}`} type="text" id="bio" name="bio"/>
                                        <ErrorMessage name="bio" component="div" className="text-left w-full flex justify-left text-[14px] mb-3 text-red-600"/>
                                    </div>
                                </div>

                                <div className="w-full mt-[24px] flex">
                                    <div className="basis-[194px] text-right px-[32px] pt-1">

                                    </div>
                                    <div className="">
                                        <button className="px-[16px] rounded-lg h-[32px] text-[14px] bg-sky-500 hover:bg-blue-500 text-white font-medium" type="submit">Submit</button>
                                    </div>
                                </div>
                            </Form>
                        </Formik>
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default PrivateRoutes(UpdateProfile);

export async function getServerSideProps(context: any) {
    const { res } = context;

    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

    return {
        props: {}
    };
}