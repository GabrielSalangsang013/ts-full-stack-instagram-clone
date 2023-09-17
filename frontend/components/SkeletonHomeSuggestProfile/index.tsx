import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonHomeSuggestProfile = () => {
    return (
        <div className='flex-1 h-[200px] sticky top-[50px]'>
            <div className='flex justify-between mb-3'>
                <Skeleton width={120} height={15} borderRadius={0} containerClassName='mt-[-4px]'/>
                <Skeleton width={40} height={15} borderRadius={0} containerClassName='mt-[-4px]'/>
            </div>

            <div className='flex h-auto gap-2'>
                <div className='w-[54px] h-[54px] flex items-center justify-center'>
                    <Skeleton width={44} height={44} circle={true} containerClassName='absolute mt-[-4px]' />
                </div>
                <div className='flex-1 flex flex-col pt-2'>
                    <Skeleton width={60} height={15} borderRadius={0} containerClassName='mt-[-4px]' />
                    <Skeleton width={100} height={15} borderRadius={0} containerClassName='mt-[-4px]' />
                </div>
                <div className='flex items-center'>
                    <Skeleton width={36} height={15} borderRadius={0} />
                </div>
            </div>
            <div className='flex h-auto gap-2'>
                <div className='w-[54px] h-[54px] flex items-center justify-center'>
                    <Skeleton width={44} height={44} circle={true} containerClassName='absolute mt-[-4px]' />
                </div>
                <div className='flex-1 flex flex-col pt-2'>
                    <Skeleton width={60} height={15} borderRadius={0} containerClassName='mt-[-4px]' />
                    <Skeleton width={100} height={15} borderRadius={0} containerClassName='mt-[-4px]' />
                </div>
                <div className='flex items-center'>
                    <Skeleton width={36} height={15} borderRadius={0} />
                </div>
            </div>
            <div className='flex h-auto gap-2'>
                <div className='w-[54px] h-[54px] flex items-center justify-center'>
                    <Skeleton width={44} height={44} circle={true} containerClassName='absolute mt-[-4px]' />
                </div>
                <div className='flex-1 flex flex-col pt-2'>
                    <Skeleton width={60} height={15} borderRadius={0} containerClassName='mt-[-4px]' />
                    <Skeleton width={100} height={15} borderRadius={0} containerClassName='mt-[-4px]' />
                </div>
                <div className='flex items-center'>
                    <Skeleton width={36} height={15} borderRadius={0} />
                </div>
            </div>
        </div>

        
    )
}

export default SkeletonHomeSuggestProfile;