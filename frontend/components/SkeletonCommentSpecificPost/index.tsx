import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonCommentSpecificPost = () => {
    return (
        <div className="flex mb-2">
            <div className="w-[65px] h-[65px] py-[14px] pl-[16px] pr-[4px] flex items-start">
                <Skeleton height={32} width={32} borderRadius={0} circle={true}/>
            </div>
            <div className="flex-1 py-[10px]">
                <Skeleton width={60} height={15} borderRadius={0} containerClassName="inline-block" />
                <Skeleton width={15} height={15} borderRadius={0} containerClassName="inline-block ml-1"/>
                <Skeleton width={24} height={15} borderRadius={0} containerClassName='ml-1'/>
                <Skeleton width={'100%'} height={15} borderRadius={0}/>
                <Skeleton width={'100%'} height={15} borderRadius={0}/>
                <Skeleton width={'100%'} height={15} borderRadius={0}/>
                <Skeleton width={30} height={15} borderRadius={0}/>
            </div>
            <div className="py-[14px] pr-[16px] flex">
                <Skeleton width={12} height={12} borderRadius={0} containerClassName='flex'/>
            </div>
        </div>
    )
}

export default SkeletonCommentSpecificPost;