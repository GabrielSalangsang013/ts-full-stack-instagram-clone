import '../globals.css';
import Layout from '@/components/Layout';
import SideNav from '@/components/SideNav';
import Head from 'next/head';
import PrivateRoutes from '@/components/PrivateRoutes';
import HomeSuggestFollowProfiles from '@/components/HomeSuggestFollowProfiles';
import '@splidejs/react-splide/css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import HomeAllPosts from '@/components/HomeAllPosts';

type authenticatedUserType = {
    username: string
}

const Home = ({authenticatedUser}: any) => {    
    const router = useRouter();
    const [sideNavActive, setSideNavActive] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
        (async () => {
            if(authenticatedUser.following.length === 0) {
                router.push('/explore/people');
            }

            setSideNavActive('Home');
            setLoading(false);
        })();
    }, []);

    return (
        <>
            <Head>
                <title>Instagram</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/instagram_icon.ico" />
            </Head>

            {
                !loading &&
                <Layout>
                    <SideNav authenticatedUser={authenticatedUser} sideNavActive={sideNavActive}/>
                    <div className='flex-1 p-4'>
                        <div className="mx-auto max-w-[955px] pt-8 flex gap-4">
                            <HomeAllPosts authenticatedUser={authenticatedUser} />
                            <HomeSuggestFollowProfiles />
                        </div>
                    </div>
                </Layout>
            }
        </>
    )
}

export default PrivateRoutes(Home);

export async function getServerSideProps(context: any) {
    const { res } = context;

    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");

    return {
        props: {}
    };
}