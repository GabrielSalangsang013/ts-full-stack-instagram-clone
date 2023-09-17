import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonAllSavedPosts = () => {
    return (
        <>
            <div className="mb-[-4px]">
                <Skeleton width={40} height={15} borderRadius={0} />
            </div>

            <div className="w-full">
                <div className="mb-1">
                    <Skeleton width={75} height={25} borderRadius={0}/>
                    <div className="w-full flex flex-wrap gap-[4px]">
                        <div className="w-[calc(33.05%-4px)] aspect-square relative cursor-pointer">
                            <Skeleton width={'100%'} height={'100%'} borderRadius={0}/>
                        </div>
                        <div className="w-[calc(33.05%-4px)] aspect-square relative cursor-pointer">
                            <Skeleton width={'100%'} height={'100%'} borderRadius={0}/>
                        </div>
                        <div className="w-[calc(33.05%-4px)] aspect-square relative cursor-pointer">
                            <Skeleton width={'100%'} height={'100%'} borderRadius={0}/>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SkeletonAllSavedPosts;