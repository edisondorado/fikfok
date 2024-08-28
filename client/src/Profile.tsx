import { Avatar, Button, Popover, PopoverContent, PopoverTrigger, Tab, Tabs } from '@nextui-org/react'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { FaBookmark, FaHeart, FaLink, FaPlay, FaShare, FaUserCheck, FaVideo } from 'react-icons/fa'
import { useLocation, useParams } from 'react-router-dom'
import { IUser } from './models/IUser';
import { Context } from './main';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { observer } from 'mobx-react-lite';
import { TiArrowForward } from 'react-icons/ti';
import toast from 'react-hot-toast';
import VideoTabs from './components/ui/VideoTabs';
import copy from 'copy-to-clipboard';
import { API_URL } from './http';
import EditProfileModal from './components/EditProfileModal';
import { useTranslation } from 'react-i18next';

function Profile() {
    const { store } = useContext(Context);
    const { t, i18n } = useTranslation();

    const { username } = useParams();
    const location = useLocation();
    const [profile, setProfile] = useState<IUser>()
    const [loading, setLoading] = useState(true);
    const [selfProfile, setSelfProfile] = useState(false);
    const [selectedTab, setSelectedTab] = useState("videos");
    const [videos, setVideos] = useState([]);
    const [savedVideos, setSavedVideos] = useState([]);

    const [isOpenEdit, setIsOpenEdit] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    document.body.classList.remove('no-scroll');

    const fetchUser = async (username) => {
        const userProfile = await store.getUserProfile(username);

        setProfile(userProfile);
        setLoading(false);
    };

    useEffect(() => {
        if (username) {
            fetchUser(username);
        }
    }, [username]);

    useEffect(() => {
        if (profile && store.user) {
            setSelfProfile(store.user.userId === profile.userId);
            setSelectedTab("videos");
        }
    }, [profile, store.user])

    useEffect(() => {
        const fetchVideos = async () => {
            if (profile) {
                if (savedVideos[selectedTab]) {
                    setVideos(savedVideos[selectedTab]);
                } else {
                    const userVideos = await store.loadUserVideos(profile.username, selectedTab);
    
                    setVideos(userVideos);
                    setSavedVideos(prevState => ({
                        ...prevState,
                        [selectedTab]: userVideos
                    }));
                }
            }
        }

        fetchVideos();
    }, [selectedTab, profile])

    useEffect(() => {
        if (profile){
            fetchUser(profile?.username)
        }
    }, [store.user.follows, store.user.followers]);

    const followUser = async () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    
        debounceTimeout.current = setTimeout(async () => {
            await store.followUser(profile?.username);
            await fetchUser(profile?.username);
        }, 1000)
    }

    if (loading){
        return (<></>)
    }

    return (
        <div className='flex flex-col mx-[20%] mt-12 gap-10'>
            <div className='flex flex-col gap-4'>
                <div className='flex flex-row'>
                    <div className='flex flex-row gap-16'>
                        <div>
                            <Avatar
                                className="w-40 h-40"
                                showFallback
                                size='lg'
                                src={`${API_URL}profile/picture/${profile.username}`}
                                name={profile.username}
                            />
                        </div>
                        <div className='flex flex-col gap-5 w-64'>
                            <div>
                                <h2 className='font-bold text-4xl'>{profile.username}</h2>
                                <p>{profile.name}</p>
                            </div>
                            {selfProfile ? (
                                <Button startContent={<FaRegPenToSquare /> } onClick={() => setIsOpenEdit(true)}>
                                    {t("profile.editprofile")}
                                </Button>
                            ) : store.user.follows && !store.user.follows.some(follow => follow.userId === profile.userId) ? (
                                <Button color='danger' onClick={followUser}>
                                    <p className='font-bold text-md'>{t("profile.follow")}</p>
                                </Button>
                            ) : store.user.follows && store.user.follows.some(follow => follow.userId === profile.userId) ? (
                                <div className='flex flex-row gap-4'>
                                    {/* TODO: redirect to messages page */}
                                    <Button color='danger' variant='bordered' className='w-full'>
                                        <p className='text-md font-bold'>{t("profile.messages")}</p>
                                    </Button>
                                    <Button isIconOnly startContent={<FaUserCheck />} variant='ghost' onClick={followUser} />
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                    <div className='ml-auto'>
                        <Popover
                            placement='top'
                            showArrow={true}
                        >
                            <PopoverTrigger>
                                <Button startContent={<FaShare />} isIconOnly variant='light' />
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className='flex flex-col gap-2 p-2'>
                                    <Button variant='shadow' color='secondary' onClick={() => {
                                        copy(`${window.location.origin}${location.pathname}${location.search}${location.hash}`)
                                        toast.success("Profile link was successfully copied")
                                    }} startContent={<FaLink />}>
                                        {t("video.copylink")}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className='flex flex-row gap-28 text-lg'>
                    <div className='flex gap-4'>
                        <b>{formatNumber(profile.follows.length)}</b> {t("profile.following")}
                    </div>
                    <div className='flex gap-4'>
                        <b>{formatNumber(profile.followers.length)}</b> {t("profile.followers")}
                    </div>
                    <div className='flex gap-4'>
                        <b>{formatNumber(profile.likes)}</b> {t("profile.likes")}
                    </div>
                </div>
                <div>
                    <p>{profile?.description || t("profile.nobio")}</p>
                </div>
            </div>
            <div className='flex flex-col'>
                <VideoTabs profile={profile} selectedTab={selectedTab} selfProfile={selfProfile} setSelectedTab={setSelectedTab} videos={videos} />
            </div>
            <EditProfileModal isOpen={isOpenEdit} setIsOpen={setIsOpenEdit} />
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

export default observer(Profile)