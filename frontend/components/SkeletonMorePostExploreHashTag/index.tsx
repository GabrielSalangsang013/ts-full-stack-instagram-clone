import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonMorePostExploreHashTag = () => {
    return (
        <>
            <div className="w-[calc(33.3%-2px)] mt-[-4px]">
                <Skeleton width={'100%'} height={'100%'} borderRadius={0} containerClassName='mt-[-10px]' className='basis-[calc(33.3%)] aspect-square bg-neutral-200 relative' />
            </div>
            <div className="w-[calc(33.3%-2px)] mt-[-4px]">
                <Skeleton width={'100%'} height={'100%'} borderRadius={0} containerClassName='mt-[-10px]' className='basis-[calc(33.3%)] aspect-square bg-neutral-200 relative' />
            </div>
            <div className="w-[calc(33.3%-2px)] mt-[-4px]">
                <Skeleton width={'100%'} height={'100%'} borderRadius={0} containerClassName='mt-[-10px]' className='basis-[calc(33.3%)] aspect-square bg-neutral-200 relative' />
            </div>
        </>
    )   
}

export default SkeletonMorePostExploreHashTag;