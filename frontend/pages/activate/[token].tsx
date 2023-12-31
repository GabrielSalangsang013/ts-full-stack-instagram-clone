import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';

import '../globals.css'

import { useEffect, useState } from 'react';

import FlexContainer from '@/components/FlexContainer';
import PublicRoutes from '@/components/PublicRoutes';

const TokenDetail = () => {
    const router = useRouter();
    const { query, isReady } = useRouter();
    const token = router.query.token;
    const [isActivated] = useState(false);

    useEffect(() => {    
        if (!isReady) return;
        if (!query.token) router.push("/")
        if(token) {
            fetch(`${process.env.REACT_APP_API}/api/v1/authentication/activate`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    token: token
                })
            })
            .then((response) => response.json())
            .then((result) => {
                if(result.status === 'ok') {
                    router.push('/login');
                }
            })
            .catch((error) => {
                alert(error);
                router.push('/register');
            });
        }else {
            router.push('/login');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady]);

    if(!isActivated) {
        return (
            <>
                <FlexContainer>
                    <Head>
                        <title>Activate Account • Instagram</title>
                        <meta name="description" content="Generated by create next app" />
                        <link rel="icon" href="/instagram_icon.ico" />
                    </Head>

                    <main className="m-auto md:mt-20 md:w-[395px]">
                        <div className="md:border md:border-[#dfdfdf] pt-4 pb-10 px-10">
                            <div className="flex justify-center flex-col items-center">
                                <div className="h-30 py-10 flex items-center flex-col text-center">
                                    <Image width={175} height={51} priority src={'/instagram_logo.png'} className="mb-2 w-auto h-auto" alt="Logo" />
                                    <h1 className="font-[500] text-lg text-[20px] text-[#737373]">Activating Account</h1>
                                    <p className="mt-8 text-md">Account activation may take a while. Please wait.</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </FlexContainer>
            </>
        )
    }

    return (
        <></> 
    )
}

export default PublicRoutes(TokenDetail);