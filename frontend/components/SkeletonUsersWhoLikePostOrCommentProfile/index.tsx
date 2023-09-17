import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonUsersWhoLikePostProfile = () => {
    return (
        <div className="w-full flex justify-between mb-3">
            <div className='flex gap-3'>
                <div className='w-[40px] h-[40px]'>
                    <Skeleton width={40} height={40} circle={true} containerClassName='mt-[-2px] absolute'/>
                </div>
                <div className='flex flex-col'>
                    <Skeleton width={60} height={15} borderRadius={0} containerClassName='mb-[-4px]'/>
                    <Skeleton width={120} height={15} borderRadius={0}/>
                </div>
            </div>
        </div>
    )
}

export default SkeletonUsersWhoLikePostProfile;