import Link from "next/link"

const ProfileTabs = ({authenticatedUser, isOwned, active = "Posts"}: any) => {
    return (
        <>
            <div className="w-[calc(100%-12px)] h-[1px] bg-neutral-200"></div>

            <div className="w-[calc(100%-12px)] flex justify-center gap-[62px] mb-12">
                <Link href={`/${authenticatedUser.username}`}>    
                    <button type="button" className={`flex items-center gap-2 h-[52px] ${active === 'Posts' && 'border-t-[1px] border-t-[#131313]'}`}>
                        {active === 'Posts' ? 
                            <svg aria-label="" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="12" role="img" viewBox="0 0 24 24" width="12">
                                <rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3"></rect>
                                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line>
                                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line>
                            </svg>
                        :
                            <svg aria-label="" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="12" role="img" viewBox="0 0 24 24" width="12">
                                <rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3"></rect>
                                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line>
                                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line>
                            </svg>  
                        }
                        <span className={`text-[12px] tracking-[1px] font-semibold ${active === 'Posts' ? '' : 'text-[#737373]'}`}>POSTS</span>
                    </button>
                </Link>

                {
                    isOwned && 
                    <Link href={`/${authenticatedUser.username}/saved`}>
                        <button type="button" className={`flex items-center gap-2 h-[52px] ${active === 'Saved' && 'border-t-[1px] border-t-[#131313]'}`}>
                            {active === 'Saved' ? 
                                <svg aria-label="" color="rgb(0, 0, 0)" fill="rgb(0, 0, 0)" height="12" role="img" viewBox="0 0 24 24" width="12">
                                    <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                                </svg>
                                :
                                <svg aria-label="" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="12" role="img" viewBox="0 0 24 24" width="12">
                                    <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                                </svg>
                            }
                            <span className={`text-[12px] tracking-[1px] font-semibold ${active === 'Saved' ? '' : 'text-[#737373]'}`}>SAVED</span>
                        </button>
                    </Link>
                }

                <button type="button" className={`flex items-center gap-2 h-[52px] ${active === 'Tagged' && 'border-t-[1px] border-t-[#131313]'}`}>
                    <svg aria-label="" color="rgb(115, 115, 115)" fill="rgb(115, 115, 115)" height="12" role="img" viewBox="0 0 24 24" width="12"><path d="M10.201 3.797 12 1.997l1.799 1.8a1.59 1.59 0 0 0 1.124.465h5.259A1.818 1.818 0 0 1 22 6.08v14.104a1.818 1.818 0 0 1-1.818 1.818H3.818A1.818 1.818 0 0 1 2 20.184V6.08a1.818 1.818 0 0 1 1.818-1.818h5.26a1.59 1.59 0 0 0 1.123-.465Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M18.598 22.002V21.4a3.949 3.949 0 0 0-3.948-3.949H9.495A3.949 3.949 0 0 0 5.546 21.4v.603" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><circle cx="12.072" cy="11.075" fill="none" r="3.556" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle></svg>
                    <span className={`text-[12px] tracking-[1px] font-semibold ${active === 'Tagged' ? '' : 'text-[#737373]'}`}>TAGGED</span>
                </button>
            </div>
        </>
    )
}

export default ProfileTabs;