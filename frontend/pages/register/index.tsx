import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import '../globals.css';

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState } from 'react';
import { escape } from 'he';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';

import FlexContainer from "@/components/FlexContainer";

import publicRoutes from "@/components/PublicRoutes";

type valuesParameter = {
    username: string,
    email: string,
    password: string,
    repeatPassword: string,
    fullName: string
}

const Register = () => {
    const [isUserActivationEmailSent, setIsUserActivationEmailSent] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const initialValues = {
        username: "",
        email: "",
        password: "",
        repeatPassword: "",
        fullName: ""
    };

    const validationSchema = Yup.object().shape({
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
            ),
        password: Yup.string()
            .required('Password is required')
            .min(12, 'Password must be at least 12 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).+$/,
                'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
            )
            .test(
                'password-security',
                'Password should not be commonly used or easily guessable',
                (value) => !/\b(password|123456789)\b/i.test(value)
            ),
        repeatPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Please repeat your password'),
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
            )
    });

    const handleSubmit = (values: valuesParameter) => {
        const {username, email, password, repeatPassword, fullName} = values;
        
        let sanitizedRegisterUsername = DOMPurify.sanitize(username);
        let sanitizedRegisterEmail = DOMPurify.sanitize(email);
        let sanitizedRegisterPassword = DOMPurify.sanitize(password);
        let sanitizedRegisterRepeatPassword = DOMPurify.sanitize(repeatPassword);
        let sanitizedRegisterFullName = DOMPurify.sanitize(fullName);

        setIsDisabled(true);

        fetch(`${process.env.REACT_APP_API}/api/v1/authentication/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: sanitizedRegisterUsername,
                email: sanitizedRegisterEmail,
                password: sanitizedRegisterPassword,
                repeatPassword: sanitizedRegisterRepeatPassword,
                fullName: sanitizedRegisterFullName
            })
        })
        .then((response) => response.json())
        .then((result) => {
            if(result.status === 'ok') {
                setIsUserActivationEmailSent(true);
            }
        })
        .catch((error) => {
            setIsDisabled(false);
            alert(error);
        });
    };

    if(isUserActivationEmailSent) { 
        return (
            <>
                <FlexContainer>
                    <Head>
                        <title>Sign up • Instagram</title>
                        <meta name="description" content="Generated by create next app" />
                        <link rel="icon" href="/instagram_icon.ico" />
                    </Head>

                    <main className="m-auto md:mt-20 md:w-[395px]">
                        <div className="md:border md:border-[#dfdfdf] pt-4 pb-20 px-10">
                            <div className="flex justify-center flex-col items-center">
                                <div className="h-30 py-10 flex items-center flex-col text-center">
                                    <Image width={175} height={51} priority  src={'/instagram_logo.png'} className="mb-2 w-auto h-auto" alt="Logo" />
                                    <h1 className="font-[500] text-lg text-[20px] text-[#737373]">Activation Link Sent</h1>
                                    <p className="mt-8 text-md">Your account activation link has been sent to your email</p>
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
                <title>Sign up • Instagram</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/instagram_icon.ico" />
            </Head>
    
            <FlexContainer>
                <main className="m-auto mt-4 md:w-[350px]">
                    <div className="md:border md:border-[#dfdfdf] pt-4 pb-10 px-10 mb-4">
                        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                            <Form>
                                <div className="flex justify-center flex-col items-center">
                                    <div className="h-30 py-4 flex items-center flex-col text-center">
                                        <Image width={175} height={51} priority src={'/instagram_logo.png'} className="mb-2 w-auto h-[70px]" alt="Logo" />
                                        <h1 className="font-[500] text-[#737373]">Sign up to see photos and videos from your friends.</h1>
                                    </div>
                                    
                                    <Field disabled={isDisabled} className={`w-full bg-[#fafafa] leading-[25px] text-[12px] py-[6px] px-[12px] border border-[#e9e9e9] mb-2 rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Email' type="email" id="email" name="email"/>
                                    <ErrorMessage name="email" component="div" className="text-left w-full flex justify-left text-[12px] mb-3 text-red-600"/>  

                                    <Field disabled={isDisabled} className={`w-full bg-[#fafafa] leading-[25px] text-[12px] py-[6px] px-[12px] border border-[#e9e9e9] mb-2 rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Full Name' type="text" id="fullName" name="fullName"/>
                                    <ErrorMessage name="fullName" component="div" className="text-left w-full flex justify-left text-[12px] mb-3 text-red-600"/>  

                                    <Field disabled={isDisabled} className={`w-full bg-[#fafafa] leading-[25px] text-[12px] py-[6px] px-[12px] border border-[#e9e9e9] mb-2 rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Username' type="text" id="username" name="username"/>
                                    <ErrorMessage name="username" component="div" className="text-left w-full flex justify-left text-[12px] mb-3 text-red-600"/>

                                    <Field disabled={isDisabled} className={`w-full bg-[#fafafa] leading-[25px] text-[12px] py-[6px] px-[12px] border border-[#e9e9e9] mb-2 rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Password' type="password" id="password" name="password"/>
                                    <ErrorMessage name="password" component="div" className="text-left w-full flex justify-left text-[12px] mb-3 text-red-600"/> 
                                    
                                    <Field disabled={isDisabled} className={`w-full bg-[#fafafa] leading-[25px] text-[12px] py-[6px] px-[12px] border border-[#e9e9e9] mb-2 rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Repeat Password' type="password" id="repeatPassword" name="repeatPassword"/>
                                    <ErrorMessage name="repeatPassword" component="div" className="text-left w-full flex justify-left text-[12px] mb-3 text-red-600"/>   
                                    
                                    <p className="text-[12px] text-center text-neutral-500 mb-2">
                                        People who use our service may have uploaded your contact information to Instagram. Learn More
                                    </p>

                                    <p className="text-[12px] text-center text-neutral-500 mb-2">
                                    By signing up, you agree to our Terms , Privacy Policy and Cookies Policy .
                                    </p>

                                    <button disabled={isDisabled} className={`flex items-center text-[14px] justify-center w-full bg-[#4cb5f9] p-[6px] font-[500] text-white mt-2 rounded-lg ${isDisabled && `opacity-50`}`} type="submit">
                                        {isDisabled && <Image width={14.5} height={15} style={{marginRight:'10px'}} src={'/spinner-circle-light.svg'} alt="none" />}
                                        Sign Up
                                    </button>
                                </div>
                            </Form>
                        </Formik>
                    </div>

                    <div className="md:border md:border-[#dfdfdf] py-6 px-10 flex items-center justify-center">
                        <span className="text-[14px]">Have an account? <Link href="/login" className="text-sky-500">Login</Link></span>
                    </div>
                </main>
            </FlexContainer>
        </>
    )
}

export default publicRoutes(Register);