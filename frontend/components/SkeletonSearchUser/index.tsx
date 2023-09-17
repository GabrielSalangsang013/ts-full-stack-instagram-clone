import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


const SkeletonSearchUser = () => {
    return (
        <div className="w-full py-[8px] px-[24px] flex gap-3 transition-[0.2s] cursor-pointer">
            <div className="w-[45px] h-[45px] relative">
                <Skeleton width={45} height={45} circle={true} className='top-[-4px] absolute'/>
            </div>
            <div className="flex flex-col">
                <Skeleton width={60} height={15} borderRadius={0} containerClassName='mb-[-4px]'/>
                <Skeleton width={120} height={15} borderRadius={0}/>
            </div>
        </div>
    )
}

export default SkeletonSearchUser;