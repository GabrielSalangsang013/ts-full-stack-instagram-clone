import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonProfilePost = () => {
    return (
        <>
            <Skeleton width={'100%'} height={'100%'} borderRadius={0} containerClassName="aspect-square w-[calc(33.05%-4px)] mt-[-4px]"/>
            <Skeleton width={'100%'} height={'100%'} borderRadius={0} containerClassName="aspect-square w-[calc(33.05%-4px)] mt-[-4px]"/>
            <Skeleton width={'100%'} height={'100%'} borderRadius={0} containerClassName="aspect-square w-[calc(33.05%-4px)] mt-[-4px]"/>
        </>
    )
}

export default SkeletonProfilePost;