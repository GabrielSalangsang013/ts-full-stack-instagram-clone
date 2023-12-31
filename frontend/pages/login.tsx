import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import publicRoutes from "@/components/PublicRoutes";

import './globals.css'

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { escape } from 'he';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';

import FlexContainer from "@/components/FlexContainer";
import Link from "next/link";

type valuesParameter = {
    username: string,
    password: string
}

const Login = () => {
    const router = useRouter();
    const [isDisabled, setIsDisabled] = useState(false);

    const initialValues = {
        username: '',
        password: ''
    };

    const validationSchema = Yup.object().shape({
        username: Yup.string()
            .required('Username is required')
            .trim()
            .min(4, 'Username must be at least 4 characters')
            .max(20, 'Username must not exceed 20 characters')
            .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
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
            )
    });

    const handleSubmit = (values: valuesParameter) => {
        const {username, password} = values;
        const sanitizedLoginUsername = DOMPurify.sanitize(username);
        const sanitizedLoginPassword = DOMPurify.sanitize(password);

        setIsDisabled(true);

        fetch(`${process.env.REACT_APP_API}/api/v1/authentication/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              username: sanitizedLoginUsername,
              password: sanitizedLoginPassword
            })
        })
        .then((response) => response.json())
        .then((result) => {
            // Handle the API response here
            if(result.status === 'ok') {
                router.push("/login/multi-factor-authentication");
            }

            setIsDisabled(false);
        })
        .catch((error) => {
            // Handle any errors that occurred during the request
            setIsDisabled(false);
            alert(error);
        });
    };

    return (
        <>
            <Head>
                <title>Login • Instagram</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/instagram_icon.ico" />
            </Head>
    
            <FlexContainer>
                <main className="m-auto md:mt-20 md:w-[350px]">
                    <div className="md:border md:border-[#dfdfdf] pt-4 pb-16 px-10 mb-4">
                        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                            <Form>
                                <div className="flex justify-center flex-col items-center">
                                    <div className="h-30 py-10">
                                        <Image width={175} height={51} priority src={'/instagram_logo.png'} alt="Logo" />
                                    </div>
                                    <Field disabled={isDisabled} className={`w-full bg-[#fafafa] leading-[25px] text-[12px] py-[6px] px-[12px] border border-[#e9e9e9] mb-2 rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Phone number, username, or email' type="text" id="username" name="username"/>
                                    <ErrorMessage name="username" component="div" className="text-left w-full flex justify-left text-[12px] mb-3 text-red-600"/>
                                    <Field disabled={isDisabled} className={`w-full bg-[#fafafa] leading-[25px] text-[12px] py-[6px] px-[12px] border border-[#e9e9e9] mb-2 rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Password' type="password" id="password" name="password"/>
                                    <ErrorMessage name="password" component="div" className="text-left w-full flex justify-left text-[12px] mb-3 text-red-600"/>   
                                    <button disabled={isDisabled} className={`text-[14px] flex items-center justify-center w-full bg-[#4cb5f9] py-[6px] px-[-20px] py-1 font-[500] text-white mt-2 rounded-lg ${isDisabled && `opacity-50`}`} type="submit">
                                        {isDisabled && <Image width={14.5} height={15} style={{marginRight:'10px'}} src={'/spinner-circle-light.svg'} alt="none" />}
                                        Log In
                                    </button>
                                </div>
                            </Form>
                        </Formik>
                    </div>

                    <div className="md:border md:border-[#dfdfdf] pt-4 py-4 px-10 text-center">
                        <span className="text-[14px]">Do not have an account? <Link href="/register" className="text-sky-500 font-medium">Sign up</Link></span>
                    </div>
                </main>
            </FlexContainer>
        </>
    )
}

export default publicRoutes(Login);