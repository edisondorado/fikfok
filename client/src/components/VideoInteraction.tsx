import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import copy from 'copy-to-clipboard';
import { observer } from 'mobx-react-lite'
import { Context } from '../main'

import toast from 'react-hot-toast'
import { Avatar, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react'

import { BiRepost } from 'react-icons/bi'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { FaBookmark, FaCheck, FaCommentDots, FaHeart, FaLink, FaPlus } from 'react-icons/fa'
import { MdReport } from 'react-icons/md'
import { PiMouseScrollFill } from 'react-icons/pi'
import { TiArrowForward } from 'react-icons/ti'
import { useTranslation } from 'react-i18next';
import { API_URL } from '../http';

function VideoInteraction({ currentVideo, setIsCommentsOpen, setCurrentVideo, getVideoById }) {
    const { store } = useContext(Context);
    const { t, i18n } = useTranslation();

    const location = useLocation();

    const [isFollowed, setIsFollowed] = useState(undefined);
    const [isFavorited, setIsFavorited] = useState(undefined)
    const [isLiked, setIsLiked] = useState(undefined);

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!store.isLoading && !store.isAuth) {
            setIsFollowed(false);
            setIsLiked(false);
            setIsFavorited(false);
        } else if (!store.isLoading && store.isAuth) {
            setIsFollowed(store.user.follows.find(user => user.userId === currentVideo.author.userId) || false)
            setIsLiked(store.user.likedVideos.find(video => video.videoId === currentVideo.videoId) || false)
            setIsFavorited(store.user.favorites.find(video => video.videoId === currentVideo.videoId) || false)
        }
    }, [store.isLoading, currentVideo, store.user]);

    const debouncedAsyncAction = (actionFn, delay = 1000) => {
        let debounceTimeout = null;
    
        return (...args) => {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
    
            debounceTimeout = setTimeout(async () => {
                try {
                    await actionFn(...args);
                } catch (err) {
                    console.warn(err);
                }
            }, delay);
        };
    };
    
    const likeVideoAction = async (videoId) => {
        const [userHasDisliked, likes] = await store.likeVideo(videoId);
        getVideoById(currentVideo.videoId);
    };
    
    const followUserAction = async () => {
        await store.followUser(currentVideo.author.username);
    };
    
    const favoriteVideoAction = async (videoId) => {
        const [userHasUnfavorited, favorites] = await store.favoriteVideo(videoId);
        getVideoById(currentVideo.videoId);
    };
    
    const repostVideoAction = async (isProfileRepost: boolean) => {
        const reposts = await store.repostVideo(currentVideo.videoId, isProfileRepost)
        if (!isProfileRepost){
            copy(`${window.location.origin}/video/${currentVideo.videoId}`)
            toast.success(t("video.linkcopied"))
        }
        if (reposts) {
            if (isProfileRepost) {
                toast.success(t("video.reposted"))
            }
        }
        getVideoById(currentVideo.videoId);
    }
    
    const handleLikeVideo = debouncedAsyncAction(likeVideoAction);
    const handleFollowUser = debouncedAsyncAction(followUserAction);
    const handleFavoriteVideo = debouncedAsyncAction(favoriteVideoAction);
    const handleRepostVideo = debouncedAsyncAction(repostVideoAction);

    return (
        <div className="flex flex-col h-full pt-10">
            <div className='flex justify-center'>
                <Dropdown size="sm">
                    <DropdownTrigger>
                        <Button
                            variant="light"
                            isIconOnly
                        >
                            <BsThreeDotsVertical size={32}/>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions">
                        <DropdownItem key="autoscroll" startContent={<PiMouseScrollFill /> }>
                            {t("video.autoscroll")}
                        </DropdownItem>
                        <DropdownItem key="report" startContent={<MdReport />} >
                            {t("video.report")}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
            <div className='flex flex-col mt-auto justify-end relative gap-6'>
                <div className='flex flex-col items-center'>
                    <div className="rounded-full border-2 border-gray-800 flex flex-col items-center justify-center">
                        <Link to={`/p/${currentVideo.author.username}`}>
                            <Avatar
                                className="cursor-pointer"
                                showFallback
                                size='lg'
                                src={`${API_URL}profile/picture/${currentVideo.author.username}`}
                                name={currentVideo.author.username}
                            />
                        </Link>
                        <span className={`absolute top-0 mt-10 bg-gray-800 p-1 rounded-full ${currentVideo.author.userId === store.user.userId ? "hidden" : "block"}`}>
                            {isFollowed ? (
                                <FaCheck className='text-white' />
                            ) : (
                                <FaPlus 
                                    className='text-white cursor-pointer'
                                    onClick={handleFollowUser}
                                />
                            )}
                        </span>
                    </div>
                </div>
                <div className='flex flex-col items-center pt-4'>
                    <Button
                        radius="full"
                        isDisabled={!store.isAuth}
                        size='md'
                        isIconOnly
                        onClick={() => handleLikeVideo(currentVideo.videoId)}
                        startContent={<FaHeart size={20} className={`${isLiked ? "text-red-500" : ""}`} />}
                    />
                    <p>{formatNumber(currentVideo.likes)}</p>
                </div>
                <div className='flex flex-col items-center'>
                    <Button
                        radius="full"
                        size='md'
                        isDisabled={!store.isAuth}
                        isIconOnly
                        onClick={() => setIsCommentsOpen(true)}
                        startContent={<FaCommentDots size={20} />}
                    />
                <p>{formatNumber(currentVideo.comments)}</p>
                </div>
                <div className='flex flex-col items-center'>
                    <Button
                        radius="full"
                        size='md'
                        isDisabled={!store.isAuth}
                        isIconOnly
                        onClick={() => handleFavoriteVideo(currentVideo.videoId)}
                        startContent={<FaBookmark size={20} className={`${isFavorited ? 'text-yellow-400' : ""}`} />}
                    />
                    <p>{formatNumber(currentVideo.favorites)}</p>
                </div>
                <div className='flex flex-col items-center'>
                    <Popover
                        placement='top'
                        showArrow={true}
                    >
                        <PopoverTrigger>
                            <Button
                                radius="full"
                                size='md'
                                isDisabled={!store.isAuth}
                                isIconOnly
                                startContent={<TiArrowForward size={24} />}
                            />
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className='flex flex-col gap-2 p-4'>
                                <Button variant='shadow' color="primary" onClick={() => handleRepostVideo(true)} startContent={<BiRepost />}>
                                    {t("video.repost")}
                                </Button>
                                <Button variant='shadow' color='secondary' onClick={() => handleRepostVideo(false)} startContent={<FaLink />}>
                                    {t("video.copylink")}
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <p>{formatNumber(currentVideo.reposts)}</p>
                </div>
            </div>
        </div>
    )
}

function formatNumber(num) {
    if (num < 1000) {
      return num;
    } else if (num < 1000000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return (num / 1000000).toFixed(1) + 'M';
    }
}

export default observer(VideoInteraction)