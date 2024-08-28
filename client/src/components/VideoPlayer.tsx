import { Button, Chip, Popover, PopoverContent, Progress, Slider, SliderValue, Spinner, Tooltip } from '@nextui-org/react'
import React, { useEffect, useRef, useState } from 'react';

import "../index.css";
import { FaPause } from 'react-icons/fa';
import { FaVolumeHigh, FaVolumeLow, FaVolumeOff } from 'react-icons/fa6';
import { RiSpeedLine } from 'react-icons/ri';
import { TbPlayerTrackNextFilled } from 'react-icons/tb';

export default function VideoPlayer({ urlVideo }) {
    const videoRef = useRef(null)
    const [volumePlayer, setVolumePlayer] = useState(localStorage.getItem('video-volume'));
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [mouseDownTimeout, setMouseDownTimeout] = useState(null);
    const [isSpedUp, setIsSpedUp] = useState(false);

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const [isContextMenu, setIsContextMenu] = useState(false);

    useEffect(() => {
        const volume = localStorage.getItem("video-volume");
        if (!volume) {
            localStorage.setItem("video-volume", 0.5)
        }

        setVolumePlayer(localStorage.getItem("video-volume"));

        videoRef.current.volume = localStorage.getItem("video-volume");
    }, [])

    useEffect(() => {
        localStorage.setItem("video-volume", volumePlayer);
        videoRef.current.volume = volumePlayer;
    }, [volumePlayer])

    const handleMouseDown = () => {
        if (videoRef.current) {
          const timeoutId = setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.playbackRate = 2.0;
              setIsSpedUp(true);
              setIsMouseDown(true);
            }
          }, 200);
    
          setMouseDownTimeout(timeoutId);
        }
      };
    
      const handleMouseUp = () => {
        if (videoRef.current) {
            if (mouseDownTimeout) {
                clearTimeout(mouseDownTimeout);
                setMouseDownTimeout(null);
            }
    
            if (videoRef.current.playbackRate === 2.0) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
    
            videoRef.current.playbackRate = 1.0;

            setIsSpedUp(false);
            setIsMouseDown(false);
        }
      };
    
      const handleMouseLeave = () => {
        if (videoRef.current && isMouseDown) {
          if (mouseDownTimeout) {
            clearTimeout(mouseDownTimeout);
            setMouseDownTimeout(null);
          }
          videoRef.current.playbackRate = 1.0;
          setIsSpedUp(false);
          setIsMouseDown(false);
        }
      };
    
      const handleClickVideo = () => {
        if (videoRef.current) {
          if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
          } else {
            videoRef.current.play();
            setIsPlaying(true);
          }
        }
      };

    useEffect(() => {
        const videoElement = videoRef.current;
        setIsLoaded(true);

        const handleLoadedMetadata = () => {
            setDuration(videoElement.duration);
        };

        const updateCurrentTime = () => {
            setCurrentTime(videoElement.currentTime);
        };

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        const intervalId = setInterval(updateCurrentTime, 100);

        videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
        videoElement.addEventListener("play", handlePlay);
        videoElement.addEventListener("pause", handlePause);
        
        return () => {
            clearInterval(intervalId);
            videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
            videoElement.removeEventListener("play", handlePlay);
            videoElement.removeEventListener("pause", handlePause);
        }
    }, [urlVideo])

    const handleContextMenu = async (event) => {
      event.preventDefault();
      
    }

    return (
        <div 
            className='group relative'
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onContextMenu={handleContextMenu}
        >
          <video
            autoPlay={true}
            ref={videoRef}
            loop={true}
            src={urlVideo}
            onClick={handleClickVideo}
            className='rounded-lg max-h-[85vh]'
          />
          {!isLoaded ? (
            <div className='flex justify-center items-center z-50'>
              <Spinner 
                color="danger"
                size='lg'
              />
            </div>
          ) : (
            <>
              <Chip 
                className={`transition-all duration-150 ease-in-out absolute inset-x-0 left-0 top-0 mt-4 mx-[47%] px-2 z-50 ${isSpedUp ? "opacity-100 visible" : "opacity-0 invisible"} pointer-events-none`}
                color='danger'
              >
                2x
              </Chip>
              <div
                className={`transition-all duration-150 ease-in-out w-full h-full bg-black bg-opacity-50 absolute inset-0 flex justify-center items-center ${isPlaying ? 'opacity-0 invisible' : 'opacity-100 visible'} pointer-events-none`}
              >
                <FaPause className={`transition-all duration-150 ease-soft-spring text-white ${isPlaying ? "text-[0px]" : "text-5xl"}`} />
              </div>
              <div className='absolute inset-x-0 bottom-0 px-4 pb-2 group-hover:block hidden'>
                <div className='group/volume absolute right-0 bottom-0 px-4 pb-10 flex flex-col items-end space-y-4'>
                  <div className='group-hover/volume:opacity-100 opacity-0'>
                    <Slider
                      aria-label='VolumeSlider'
                      orientation="vertical"
                      maxValue={1}
                      value={volumePlayer}
                      color='foreground'
                      onChange={(value: SliderValue) => setVolumePlayer(value)}
                      step={0.01}
                      className='w-10 h-32'
                      defaultValue={0.2}
                      minValue={0}
                    />
                  </div>
                  <Button 
                    isIconOnly={true} 
                    startContent={parseFloat(volumePlayer) === 0 ? <FaVolumeOff /> : parseFloat(volumePlayer) < 0.5 ? <FaVolumeLow /> : parseFloat(volumePlayer) > 0.5 ? <FaVolumeHigh /> : <></>} 
                    variant='bordered' 
                  />
                </div>
                <Slider 
                  aria-label='VideoSlider'
                  color="foreground"
                  maxValue={duration}
                  value={currentTime}
                  size='md'
                  showOutline
                  onChange={(value: SliderValue) => videoRef.current.currentTime = value}
                  step={0.001}
                  hideThumb
                />
              </div>
            </>
          )}
        </div>
    )
}
