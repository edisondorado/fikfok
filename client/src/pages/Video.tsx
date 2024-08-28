import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { Context } from '../main';
import { IVideo } from '../models/IVideo';

import Comments from '../components/ui/Comments';
import VideoPlayer from '../components/VideoPlayer';
import VideoInteraction from '../components/VideoInteraction';

import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import NavigationVideos from '../components/NavigationVideos';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '../http';

function Video({ type }) {
    const { store } = useContext(Context);

    const { username, videoId } = useParams();
    
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const filter = queryParams.get("filter")
    const videoIndex = queryParams.get("videoIndex") || 1

    const [currentVideo, setCurrentVideo] = useState<IVideo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [transitionDirection, setTransitionDirection] = useState('none');
    const [historyVideo, setHistoryVideo] = useState([]);
    const [currentIndexVideo, setCurrentIndexVideo] = useState(0);

    const [profileVideoIndex, setProfileVideoIndex] = useState(videoIndex);
    const [totalVideos, setTotalVideos] = useState(0);

    const getRandomVideo = async (currentVideoId = null) => {
        try {
            const randomVideo = await store.getRandomVideo(currentVideoId);

            setCurrentVideo(randomVideo);
            setHistoryVideo(prevHistory => [
                ...prevHistory,
                randomVideo.videoId
            ])
            setCurrentIndexVideo(historyVideo.length+1);
        } catch(error) {
            console.error('Error getting random video:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const getPrevVideo = async () => {
        try {
            const prevVideoId = historyVideo[currentIndexVideo - 2];
            const prevVideo = await store.getVideo(prevVideoId);

            setCurrentIndexVideo(prevIndex => prevIndex - 1);
            setCurrentVideo(prevVideo);
        } catch (error) {
            console.error('Error fetching previous video:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const getNextVideo = async () => {
        try {
            const nextVideoId = historyVideo[currentIndexVideo];
            const nextVideo = await store.getVideo(nextVideoId);

            setCurrentIndexVideo(prevIndex => prevIndex + 1);
            setCurrentVideo(nextVideo);
        } catch (error) {
            console.error('Error fetching next video:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const getVideo = async () => {
        try {
            const video = await store.getVideo(videoId);
            setCurrentVideo(video);
            setHistoryVideo(prevHistory => [
                ...prevHistory,
                video.videoId
            ])
            setCurrentIndexVideo(historyVideo.length+1);
        } catch(error) {
            console.error('Error getting video:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const getUserVideo = async (username: string) => {
        try {
            const [video, totalVideos] = await store.getUserVideos(username, profileVideoIndex, filter);
            setCurrentVideo(video);
            setTotalVideos(totalVideos);
        } catch (error) {
            console.error('Error getting user video:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const getVideoById = async (vidId: string) => {
        try {
            const video = await store.getVideo(vidId);
            setCurrentVideo(video);
        } catch (error){
            console.error('Error getting video:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const updateVideoIndex = (newIndex) => {
        if (type === "profile"){
            queryParams.set("videoIndex", newIndex);
            navigate(`${location.pathname}?${queryParams.toString()}`);
        }
    };

    useEffect(() => {
        console.log(profileVideoIndex)
        const updateVideo = async () => {
            if (type === "video") {
                await getVideo(videoId);
            } else if (type === "profile"){
                await getUserVideo(username);
            } else {
                await getRandomVideo();
            }
            if (transitionDirection === "next") {
                setTransitionDirection('next-none');
            } else if (transitionDirection === "prev") {
                setTransitionDirection('none');
            }
        }

        updateVideo();
        updateVideoIndex(profileVideoIndex)
    }, [profileVideoIndex]);

    useEffect(() => {
        if (videoIndex) {
            setProfileVideoIndex(parseInt(videoIndex, 10));
        }
    }, [videoIndex]);

    const handleNextVideo = async () => {
        setTransitionDirection('next');

        setTimeout(async () => {
            if (type === "profile") {
                setProfileVideoIndex(prevState => prevState + 1)
            } else {
                if (currentIndexVideo < historyVideo.length)
                    await getNextVideo()
                else
                    await getRandomVideo(historyVideo[currentIndexVideo]);

                setTransitionDirection('next-none');
            }
        }, 500);
    };

    const handlePreviousVideo = async () => {
        if (type !== "profile" && historyVideo[currentIndexVideo - 1] === undefined) return;
        setTransitionDirection('prev');

        setTimeout(async () => {
            if (type === "profile") {
                setProfileVideoIndex(prevState => prevState - 1)
            } else {
                await getPrevVideo();

                setTransitionDirection('none');
            }
        }, 500);
    };

    document.body.classList.add('no-scroll');
    const videoUrl = currentVideo ? `${API_URL}video/watch/${currentVideo.videoId}` : '';

    return (
        <div className='bg-white text-black dark:bg-black dark:text-white h-full flex justify-center gap-2 my-5'>
            <div 
                className={`dark:text-white transition-all duration-1000 ease-in-out ${
                transitionDirection === 'next' ? 'animate-slideUpOut' :
                transitionDirection === 'prev' ? 'animate-slideDownOut' :
                transitionDirection === 'next-none'? 'animate-slideUpIn' :
                'animate-slideDownIn'
                }`}
            >
                {!isLoading && currentVideo !== null && (
                    <VideoInteraction currentVideo={currentVideo} setIsCommentsOpen={setIsCommentsOpen} setCurrentVideo={setCurrentVideo} getVideoById={getVideoById} />
                )}
            </div>
            <div 
                className={`flex justify-center items-center pt-10 ${
                transitionDirection === 'next' ? 'animate-slideUpOut' :
                transitionDirection === 'prev' ? 'animate-slideDownOut' :
                transitionDirection === 'next-none'? 'animate-slideUpIn' :
                'animate-slideDownIn'
                }`}
            >
                <VideoPlayer urlVideo={videoUrl} />
            </div>
            <NavigationVideos isShow={type && type === "video" ? false : true} type={type} curIndex={type && type === "profile" ? profileVideoIndex : currentIndexVideo} totalVideos={totalVideos} prevVideo={handlePreviousVideo} nextVideo={handleNextVideo} />
            {!isLoading && currentVideo !== null && (
                <Comments isOpen={isCommentsOpen} setIsOpen={setIsCommentsOpen} videoId={currentVideo?.videoId} />
            )}
        </div>
    );
}

export default observer(Video);
