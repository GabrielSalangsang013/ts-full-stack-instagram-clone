import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonExplorePost = () => {
    return (
        <>
            <div className='max-w-[963px] w-full flex mt-[3px]'>
                <div className='w-[calc(66.9%)] h-auto flex flex-wrap box-border gap-[3px] mt-[-4px] mb-[4px]'>
                    <div className="w-[calc(50%-3px)]">
                        <Skeleton height={'100%'} width={'100%'} borderRadius={0} className='basis-[calc(50%)] aspect-square h-full w-full mb-[9px]'/>
                    </div>
                    <div className="w-[calc(50%-3px)]">
                        <Skeleton height={'100%'} width={'100%'} borderRadius={0} className='basis-[calc(50%)] aspect-square h-full w-full mb-[9px]'/>
                    </div>
                    <div className="w-[calc(50%-3px)]">
                        <Skeleton height={'100%'} width={'100%'} borderRadius={0} className='basis-[calc(50%)] aspect-square h-full w-full mb-[9px]'/>
                    </div>
                    <div className="w-[calc(50%-3px)]">
                        <Skeleton height={'100%'} width={'100%'} borderRadius={0} className='basis-[calc(50%)] aspect-square h-full w-full mb-[9px]'/>
                    </div>
                </div>

                <div className='flex-1 flex flex-wrap w-full'>
                    <div className="w-[calc(100%)] h-full mt-[-4px]">
                        <Skeleton height={'100%'} width={'100%'} borderRadius={0} className='h-full relative'/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SkeletonExplorePost;