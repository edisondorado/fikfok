import { Chip, Tab, Tabs } from '@nextui-org/react';
import React, { useMemo } from 'react';
import { FaVideo, FaPlay, FaBookmark, FaHeart } from 'react-icons/fa';
import { TiArrowForward } from 'react-icons/ti';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../../http';
import { useTranslation } from 'react-i18next';

const VideoGrid = React.memo(({ videos, filter }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    return (
        <div className='grid grid-cols-4 gap-4'>
            {videos && videos.map((video, index) => (
                <div key={video.videoId} onClick={() => navigate(`${location.pathname}/videos?videoIndex=${index+1}${filter !== "videos" ? `&filter=${filter}` : "" }`)} className='cursor-pointer relative overflow-hidden w-[90%] h-auto flex items-center bg-neutral-500 rounded-md'>
                    <img
                        src={`${API_URL}video/watch/${video.videoId}/thumbnail`} 
                        alt={video.name} 
                        className='w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 flex items-end justify-start bg-black transition-all duration-100 ease-in-out bg-opacity-50 hover:bg-opacity-0 text-white text-center p-4'>
                        <div className='flex flex-row justify-center items-center gap-2'>
                            <FaPlay /> {video.views}
                        </div>
                    </div>
                    {filter === "videos" && video.isPinned ? (
                        <div className='absolute inset-0 pl-2 pt-2 flex items-start justify-start'>
                            <Chip color='danger' radius='sm' >
                                <p className='font-semibold'>{t("profile.pinned")}</p>
                            </Chip>
                        </div>
                    ) : (<></>)}
                </div>
            ))}
        </div>
    )
});

function VideoTabs({ selectedTab, setSelectedTab, selfProfile, profile, videos }) {
    const { t, i18n } = useTranslation();
    const sortVideos = (videos) => {
        if (videos) {
            return videos.sort((a, b) => {
                if (a.isPinned && !b.isPinned) {
                    return -1;
                }
                if (!a.isPinned && b.isPinned){
                    return 1;
                }
    
                return 0;
            })
        }
    }

    const tabsConfig = useMemo(() => [
        {
            key: "videos",
            title: (
                <div className="flex items-center space-x-2">
                    <FaVideo size={18} />
                    <span>{t("profile.videos")}</span>
                </div>
            ),
            show: true
        },
        {
            key: "reposts",
            title: (
                <div className="flex items-center space-x-2">
                    <TiArrowForward size={18} />
                    <span>{t("profile.reposts")}</span>
                </div>
            ),
            show: selfProfile || !profile?.private.isRepostedVideosPrivate
        },
        {
            key: "favorites",
            title: (
                <div className="flex items-center space-x-2">
                    <FaBookmark size={18} />
                    <span>{t("profile.favorites")}</span>
                </div>
            ),
            show: selfProfile
        },
        {
            key: "likes",
            title: (
                <div className="flex items-center space-x-2">
                    <FaHeart size={18} />
                    <span>{t("profile.likes")}</span>
                </div>
            ),
            show: selfProfile || !profile?.private.isLikedVideosPrivate
        }
    ], [selfProfile, profile?.private]);

    return (
        <Tabs 
            aria-label="Videos" 
            color="danger" 
            variant="underlined"
            selectedKey={selectedTab}
            onSelectionChange={setSelectedTab}
        >
            {tabsConfig.map(tab => (
                tab.show && (
                    <Tab key={tab.key} title={tab.title}>
                        <VideoGrid videos={tab.key === "videos" ? sortVideos(videos) : videos} filter={tab.key} />
                    </Tab>
                )
            ))}
        </Tabs>
    );
}

export default VideoTabs