import React, { useEffect } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

function NavigationVideos({ type, isShow, curIndex, totalVideos, prevVideo, nextVideo }) {
    if (!isShow) return (
        <></>
    )

    useEffect(() => {
        console.log('Total videos:', totalVideos)
        console.log("profileVideoIndex:", curIndex)
        console.log("curIndex >= totalVideos:", curIndex >= totalVideos)
    }, [curIndex, totalVideos])

    return (
        <div className='absolute right-0 bottom-0 pr-16 mb-[20%] dark:text-white'>
            <FaChevronUp
                className={`transition-colors duration-250 ease-in-out text-neutral-500 ${curIndex-1 < 1 ? "pointer-events-none" : "cursor-pointer hover:text-white"}`}
                size={32}
                onClick={() => {
                    if (curIndex-1 > 0) {
                        prevVideo()
                    }
                }}
            />
            <FaChevronDown 
                className={`transition-colors duration-250 ease-in-out text-neutral-500 hover:text-white ${type && curIndex >= totalVideos ? "pointer-events-none" : "cursor-pointer"}`}
                size={32} 
                onClick={nextVideo}
            />
        </div>
    )
}

export default NavigationVideos