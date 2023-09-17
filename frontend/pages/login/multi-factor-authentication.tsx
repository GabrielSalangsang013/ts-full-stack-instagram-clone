import Image from 'next/image';
import { useRouter } from 'next/router';
import Head from 'next/head';

import '../globals.css';

import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { escape } from 'he';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';  // FOR SANITIZING USER INPUT TO PREVENT XSS ATTACKS BEFORE SENDING TO THE BACKEND
import Container from '@/components/Container';
import FlexContainer from '@/components/FlexContainer';
import MFARoutes from '@/components/MFARoutes';

type valuesSubmitParameter = {
    verificationCodeLogin: string
}

type valuesGoogleSubmitParameter = {
    googleAuthenticatorCodeLogin: string
}

const MultiFactorAuthentication = ({authenticatedUser}: any) => {
    const router = useRouter();
    const [showButtonDisplayGoogleAuthenticatorForm, setShowButtonDisplayGoogleAuthenticatorForm] = useState(false);
    const [useGoogleAuthenticatorForm, setUseGoogleAuthenticatorForm] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const initialValues = {
        verificationCodeLogin: ''
    };

    const initialValuesGoogleAuthenticator = {
        googleAuthenticatorCodeLogin: ''
    };

    const validationSchema = Yup.object().shape({
        verificationCodeLogin: Yup.string()
            .required('Verification login code is required')
            .min(7, 'Verification login code must be 7 characters')
            .max(7, 'Verification login code must be 7 characters')
            .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{7}$/, 'Verification login code must be 7 characters and contain only numbers and letters')
            .test(
                'verificationCodeLogin', 
                'Verification login code should not contain sensitive information', 
                value => {
                    return !/\b(admin|root|superuser)\b/i.test(value);
                }
            )
            .test(
                'verificationCodeLogin', 
                'Invalid verification login code format or potentially unsafe characters', 
                value => {
                    const sanitizedValue = escape(value);
                    return sanitizedValue === value;
                }
            )
    });

    const validationSchemaGoogleAuthenticator = Yup.object().shape({
        googleAuthenticatorCodeLogin: Yup.string()
            .required('Google Authenticator Code Login is required')
            .matches(/^\d{6}$/, 'Code must be a 6-digit number'),
    });

    const handleSubmit = (values: valuesSubmitParameter) => {
        const {verificationCodeLogin} = values;
        const sanitizedVerificationCodeLogin = DOMPurify.sanitize(verificationCodeLogin);
        
        setIsDisabled(true);
        
        fetch(`${process.env.REACT_APP_API}/api/v1/authentication/verification-code-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                verificationCodeLogin: sanitizedVerificationCodeLogin
            })
        })
        .then((response) => response.json())
        .then((result) => {
            if(result.status === 'ok') {
                router.push("/home");
            } 
        })
        .catch((error) => {
            setIsDisabled(false);
            alert(error);
        });
    };

    const handleSubmitGoogleAuthenticator = (values: valuesGoogleSubmitParameter) => {
        const {googleAuthenticatorCodeLogin} = values;
        const sanitizedGoogleAuthenticatorCodeLogin = DOMPurify.sanitize(googleAuthenticatorCodeLogin);
        
        setIsDisabled(true);

        fetch(`${process.env.REACT_APP_API}/api/v1/authentication/google-authenticator-code-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                googleAuthenticatorCodeLogin: sanitizedGoogleAuthenticatorCodeLogin
            })
        })
        .then((response) => response.json())
        .then((result) => {
            if(result.status === 'ok') {
                router.push("/home");
            } 
        })
        .catch((error) => {
            setIsDisabled(false);
            alert(error);
        });
    }

    const handleLogout = () => {
        setIsDisabled(true);

        fetch(`${process.env.REACT_APP_API}/api/v1/authentication/verification-code-login/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then((response) => response.json())
        .then((result) => {
            if(result.status === 'ok') {
                router.push("/login");
            } 
        })
        .catch((error) => {
            setIsDisabled(false);
            alert(error);
        });
    }

    const switchFormToGoogleAuthenticatorForm = () => {
        setUseGoogleAuthenticatorForm(true);
    }

    const switchSendVerificationCodeForm = () => {
        setUseGoogleAuthenticatorForm(false);
    }
    
    useEffect(() => {
        if(authenticatedUser.hasGoogleAuthenticator) {
            setShowButtonDisplayGoogleAuthenticatorForm(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            { !useGoogleAuthenticatorForm && 
                <>
                    <Container>
                        <Head>
                            <title>MFA • Instagram</title>
                            <meta name="description" content="Generated by create next app" />
                            <link rel="icon" href="/instagram_icon.ico" />
                        </Head>

                        <header className='border-b-2 border-b-gray bg-[#fcfcfc]'>
                            <FlexContainer>
                                <div className='w-full h-20 flex justify-between items-center'>
                                    <div className="w-[120px] h-full relative flex items-center justify-center">
                                        <Image width={120} height={120} priority src={'/instagram_logo.png'} className='h-[50px] w-auto' alt="Logo" />
                                    </div>

                                    <div className='flex items-center gap-[10px]'>
                                        <div className="w-[30px] h-[30px] rounded-[30px] overflow-hidden relative">
                                            <Image width={30} height={30} priority src={authenticatedUser.profilePicture} alt="Logo" />
                                        </div>
                                        <button disabled={isDisabled} onClick={handleLogout} type="button" className={`${isDisabled && `opacity-50`}`}>Logout</button>
                                    </div>
                                </div>
                            </FlexContainer>
                        </header>

                        <main className="m-auto md:mt-20 md:w-[395px]">
                            <div className="md:border md:border-[#dfdfdf] pt-4 pb-20 px-10">
                                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                                    <Form>
                                        <div className="flex justify-center flex-col items-center">

                                            <div className="h-30 py-10 flex items-center flex-col text-center">
                                                <Image width={175} height={51} priority src={'/instagram_logo.png'} alt="Logo" />
                                                <h1 className="font-[500] text-lg text-[20px] text-[#737373]">MFA - Login Code</h1>
                                                <p className="mt-8 text-md">Please enter your login code to verify</p>
                                            </div>

                                            <Field disabled={isDisabled} className={`w-full bg-[#fafafa] leading-[25px] text-[14px] py-[8px] px-[12px] border border-[#e9e9e9] mb-2 rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Verification code login' type="text" id="verificationCodeLogin" name="verificationCodeLogin"/>
                                            <ErrorMessage name="verificationCodeLogin" component="div" className="text-left w-full flex justify-left text-[14px] mb-3 text-red-600"/>
                                            
                                            <button disabled={isDisabled} className={`flex items-center justify-center w-full bg-[#4cb5f9] px-[-20px] py-2 font-[500] text-white mt-2 rounded-lg ${isDisabled && `opacity-50`}`} type="submit">
                                                {isDisabled && <Image width={14.5} height={15} style={{marginRight:'10px'}} src={'/spinner-circle-light.svg'} alt="none" />}
                                                Submit
                                            </button>
                                        
                                            { showButtonDisplayGoogleAuthenticatorForm && 
                                                <>
                                                    <button disabled={isDisabled} onClick={switchFormToGoogleAuthenticatorForm} className={`flex items-center justify-center w-full bg-[#4cb5f9] px-[-20px] py-2 font-[500] text-white mt-2 rounded-lg ${isDisabled && `opacity-50`}`} type="button">
                                                        {isDisabled && <Image width={14.5} height={15} style={{marginRight:'10px'}} src={'/spinner-circle-light.svg'} alt="none" />}
                                                        Use Google Authenticator
                                                    </button>
                                                </>
                                            }
                                        </div>
                                    </Form>
                                </Formik>
                            </div>
                        </main>
                    </Container>
                </>
            } 

            { useGoogleAuthenticatorForm && 
                <> 
                    <Container>
                        <Head>
                            <title>MFA • Instagram</title>
                            <meta name="description" content="Generated by create next app" />
                            <link rel="icon" href="/instagram_icon.ico" />
                        </Head>

                        <header className='border-b-2 border-b-gray bg-[#fcfcfc]'>
                            <FlexContainer>
                                <div className='w-full h-20 flex justify-between items-center'>
                                    <div className="w-[120px] h-full relative flex">
                                        <Image width={120} height={120} priority src={'/instagram_logo.png'} alt="Logo" />
                                    </div>

                                    <div className='flex items-center gap-[10px]'>
                                        <div className="w-[30px] h-[30px] rounded-[30px] overflow-hidden relative">
                                            <Image width={30} height={30} priority src={authenticatedUser.profilePicture} alt="Logo" />
                                        </div>
                                        <button disabled={isDisabled} onClick={handleLogout} type="button" className={`${isDisabled && `opacity-50`}`}>Logout</button>
                                    </div>
                                </div>
                            </FlexContainer>
                        </header>

                        <main className="m-auto md:mt-20 md:w-[395px]">
                            <div className="md:border md:border-[#dfdfdf] pt-4 pb-20 px-10">
                                <Formik initialValues={initialValuesGoogleAuthenticator} validationSchema={validationSchemaGoogleAuthenticator} onSubmit={handleSubmitGoogleAuthenticator}>
                                    <Form>
                                        <div className="flex justify-center flex-col items-center">

                                            <div className="h-30 py-10 flex items-center flex-col text-center">
                                                <Image width={175} height={51} priority src={'/instagram_logo.png'} alt="Logo" />
                                                <h1 className="font-[500] text-lg text-[20px] text-[#737373]">Google Authenticator Code</h1>
                                                <p className="mt-8 text-md">Please enter your 6-digit code to verify</p>
                                            </div>

                                            <Field disabled={isDisabled} className={`w-full bg-[#fafafa] leading-[25px] text-[14px] py-[8px] px-[12px] border border-[#e9e9e9] mb-2 rounded-sm ${isDisabled && `opacity-50`}`} placeholder='Verification code login' type="text" id="googleAuthenticatorCodeLogin" name="googleAuthenticatorCodeLogin"/>
                                            <ErrorMessage name="googleAuthenticatorCodeLogin" component="div" className="text-left w-full flex justify-left text-[14px] mb-3 text-red-600"/>
                                            
                                            <button disabled={isDisabled} className={`flex items-center justify-center w-full bg-[#4cb5f9] px-[-20px] py-2 font-[500] text-white mt-2 rounded-lg ${isDisabled && `opacity-50`}`} type="submit">
                                                {isDisabled && <Image width={14.5} height={15} style={{marginRight:'10px'}} src={'/spinner-circle-light.svg'} alt="none" />} 
                                                Submit
                                            </button>
                                        
                                            <button disabled={isDisabled} onClick={switchSendVerificationCodeForm} className={`flex items-center justify-center w-full bg-[#4cb5f9] px-[-20px] py-2 font-[500] text-white mt-2 rounded-lg ${isDisabled && `opacity-50`}`} type="button">
                                                {isDisabled && <Image width={14.5} height={15} style={{marginRight:'10px'}} src={'/spinner-circle-light.svg'} alt="none" />} 
                                                Send Verification Code
                                            </button>
                                        </div>
                                    </Form>
                                </Formik>
                            </div>
                        </main>
                    </Container>
                </>
            }
        </>
    )
}

export default MFARoutes(MultiFactorAuthentication);