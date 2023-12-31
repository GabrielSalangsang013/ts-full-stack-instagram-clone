import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';

import '../globals.css';

import { useState } from 'react';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { escape } from 'he';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';  // FOR SANITIZING USER INPUT TO PREVENT XSS ATTACKS BEFORE SENDING TO THE BACKEND
import PublicRoutes from '@/components/PublicRoutes';

import FlexContainer from '@/components/FlexContainer';

const ForgotPassword = () => {
    const [isUserAccountRecoveryResetPasswordEmailSent, setIsUserAccountRecoveryResetPasswordEmailSent] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const initialValues = {
        email: ''
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .required('Email is required')
            .trim()
            .matches(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please enter a valid email address'
            )
            .email('Please enter a valid email address')
            .test(
              'email-xss-nosql',
              'Invalid email format or potentially unsafe characters',
              (value) => {
                const sanitizedValue = escape(value);
                return sanitizedValue === value; // Check if sanitized value is the same as the original value
              }
            )
    });

    const handleSubmit = (values: any) => {
        const {email} = values;
        let sanitizedRegisterEmail = DOMPurify.sanitize(email);
        setIsDisabled(true);
        fetch(`${process.env.REACT_APP_API}/api/v1/authentication/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: sanitizedRegisterEmail
            })
        })
        .then((response) => response.json())
        .then((result) => {
           if(result.status === 'ok') {
                setIsUserAccountRecoveryResetPasswordEmailSent(true);
           }
        })
        .catch((error) => {
            setIsDisabled(false);
            alert(error);
        });
    };

    if(isUserAccountRecoveryResetPasswordEmailSent) {
        return (
            <>
                <FlexContainer>
                    <Head>
                        <title>Forgot Password • Instagram</title>
                        <meta name="description" content="Generated by create next app" />
                        <link rel="icon" href="/instagram_icon.ico" />
                    </Head>

                    <main className="m-auto md:mt-20 md:w-[395px]">
                        <div className="md:border md:border-[#dfdfdf] pt-4 pb-20 px-10">
                            <div className="flex justify-center flex-col items-center">
                                <div className="h-30 py-10 flex items-center flex-col text-center">
                                    <Image width={175} height={51} priority  src={'/instagram_logo.png'} className="mb-2 w-auto h-auto" alt="Logo" />
                                    <h1 className="font-[500] text-lg text-[20px] text-[#737373]">Recovery Account Email Sent</h1>
                                    <p className="mt-8 text-md">Email has been sent to recover your account by updating your password.</p>
                                    <Link href="/login" className="mt-6 text-blue-500 underline">Go back to login page</Link>
                                </div>
                            </div>
                        </div>
                    </main>
                </FlexContainer>
            </>
        )
    }

    return (
        <>
            <Head>
                <title>Forgot Password • Instagram</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/instagram_icon.ico" />
            </Head>
    
            <FlexContainer>
                <main className="m-auto md:mt-20 md:w-[395px]">
                    <div className="md:border md:border-[#dfdfdf] pt-4 pb-20 px-10">
                        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                            <Form>
                                <div className="flex justify-center flex-col items-center">
                                    <div className="h-30 py-10 flex items-center flex-col text-center">
                                        <Image width={175} height={51} priority src={'/instagram_logo.png'} className="mb-2 w-auto h-auto" alt="Logo" />
                                        <h1 className="font-[500] text-lg text-[20px] text-[#737373]">Recovery Account Form</h1>
                                        <p className="mt-8 text-md">You forgot your password? Don&apos;t worry enter your email here to reset your password.</p>
                                    </div>
                                    <Field disabled={isDisabled} className={`w-full bg-[#fafafa] leading-[25px] text-[14px] py-[8px] px-[12px] border border-[#e9e9e9] mb-2 rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Please enter your email' type="text" id="email" name="email"/>
                                    <ErrorMessage name="email" component="div" className="text-left w-full flex justify-left text-[14px] mb-3 text-red-600"/>
   
                                    <button disabled={isDisabled} className={`flex items-center justify-center w-full bg-[#4cb5f9] px-[-20px] py-2 font-[500] text-white mt-2 rounded-lg ${isDisabled && `opacity-50`}`} type="submit">
                                        {isDisabled && <Image width={14.5} height={15} style={{marginRight:'10px'}} src={'/spinner-circle-light.svg'} alt="none" />}
                                        Submit
                                    </button>
                                </div>
                            </Form>
                        </Formik>
                    </div>
                </main>
            </FlexContainer>
        </>
    )
}

export default PublicRoutes(ForgotPassword);