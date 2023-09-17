import { NextResponse } from 'next/server';

async function middleware(req: any) {
    // const isAuthenticated = req.cookies.get('AUTH_TOKEN');
    // const hasMFAToken = req.cookies.get('MFA_TOKEN');
    // const url = req.url;
    const { pathname } = req.nextUrl;

    if (pathname == '/') {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // // * IF USER HAVE MFA_TOKEN AND IN THE PUBLIC PAGES
    // if(hasMFAToken && (pathname === '/login' || pathname === '/register' || url.includes('/activate'))) {
    //     return NextResponse.redirect(req.nextUrl.origin + '/login/multi-factor-authentication');
    // }

    // // * IF USER HAVE DON'T MFA_TOKEN AND IN THE MFA PAGE
    // if(!hasMFAToken && (pathname === '/login/multi-factor-authentication')) {
    //     return NextResponse.redirect(req.nextUrl.origin + '/login');
    // }

    // // * IF USER IS AUTHENTICATED AND IN PUBLIC PAGES
    // if (isAuthenticated && (pathname === '/login' || pathname === '/register' || pathname === '/login/multi-factor-authentication' || url.includes('/activate'))) {
    //     return NextResponse.redirect(req.nextUrl.origin + '/home');
    // }

    // // * IF USER IS NOT AUTHENTICATED AND IN PRIVATE PAGES
    // if (!isAuthenticated && (url.includes('/home'))) {
    //     return NextResponse.redirect(req.nextUrl.origin + '/login');
    // }
}

export default middleware;