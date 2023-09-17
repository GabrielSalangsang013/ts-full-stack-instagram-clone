import SkeletonMorePostExploreHashTag from "../SkeletonMorePostExploreHashTag";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonExploreHashTagFirstPosts = () => {
    return (
        <div className='flex-1 p-4'>
            <div className="mx-auto max-w-[963px] pt-3">
                <header className='h-[200px] flex gap-12'>
                    <div className='w-[150px] mt-[-4px]'>
                        <Skeleton width={150} height={150} circle={true} className='w-[150px] h-[150px]' />
                    </div>
                    <div className='flex-1'>
                        <Skeleton width={235} height={40} borderRadius={0} className='w-[235px] h-[40px]' />
                        <Skeleton width={20} height={20} borderRadius={0} className='w-[20px] h-[20px]' />
                        <Skeleton width={60} height={20} borderRadius={0} className='w-[20px] h-[20px]' />
                    </div>
                </header>
                <div className="mt-[-4px] mb-[4px]">
                    <Skeleton width={64} height={20} borderRadius={0} className='w-[65] h-[20px]' />
                </div>
                <main>
                    <div className='max-w-[963px] w-full flex mt-[3px]'>
                        <div className='w-full flex flex-wrap box-border gap-[3px]'>
                            <SkeletonMorePostExploreHashTag />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default SkeletonExploreHashTagFirstPosts;