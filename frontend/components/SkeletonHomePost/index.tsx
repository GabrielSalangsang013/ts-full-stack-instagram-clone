import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SkeletonHomePost = () => {
    return (
        <div className='flex justify-center mt-2'>
            <article className='w-[470px]'>
                <header className='flex gap-[10px] justify-center items-center mb-4'>
                    <div className='w-[42px] h-[42px]'>
                        <Skeleton circle={true} width={42} height={42} borderRadius={0} containerClassName='absolute mt-[-4px]' />
                    </div>
                    <div className='flex-1 h-[42px] flex flex-col justify-center'>
                        <div className='flex gap-[8px] items-center'>
                            <Skeleton width={60} height={15} borderRadius={0} containerClassName='mt-[-4px]' />
                            <Skeleton width={10} height={15} borderRadius={0} containerClassName='mt-[-4px]' />
                            <Skeleton width={15} height={15} borderRadius={0} containerClassName='mt-[-4px]' />
                        </div>
                        <Skeleton width={75} height={15} borderRadius={0} containerClassName='mt-[-4px]' />
                    </div>
                    <Skeleton width={32} height={32} borderRadius={0} containerClassName='mt-[-4px]' />
                </header>
                <main className='w-full mb-4'>
                    <Skeleton height={400} borderRadius={0} containerClassName='relative mt-[-16px]' />
                </main>
                <footer className='w-full'>
                    <div className='flex justify-between'>
                        <div className='flex gap-2'>
                            <Skeleton width={24} height={24} borderRadius={0} containerClassName='mt-[-4px]' />
                            <Skeleton width={24} height={24} borderRadius={0} containerClassName='mt-[-4px]' />
                            <Skeleton width={24} height={24} borderRadius={0} containerClassName='mt-[-4px]' />
                        </div>

                        <div>
                            <Skeleton width={24} height={24} borderRadius={0} containerClassName='mt-[-4px]' />
                        </div>
                    </div>
                    
                    <div className='flex items-center mt-2 mb-1'>
                        <Skeleton width={100} height={20} borderRadius={0} containerClassName='mt-[-4px]' />
                        <Skeleton width={20} height={20} borderRadius={0} containerClassName='ml-2 mt-[-4px]' />
                    </div>

                    <Skeleton width={'100%'} height={20} borderRadius={0} containerClassName='mt-[-8px]' />

                    <div className='flex gap-2 mt-2'>
                        <div className='flex-1'>
                            <Skeleton width={'100%'} height={40} borderRadius={0} containerClassName='mt-[-2px]' />
                        </div>
                        <Skeleton width={30} height={15} borderRadius={0} />
                        <div className='relative mt-[-1px]'>
                            <Skeleton width={13} height={13} borderRadius={0} containerClassName='mt-[-4px]' />
                        </div>
                    </div>
                </footer>
            </article>
        </div>
    )
}

export default SkeletonHomePost;