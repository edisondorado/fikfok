import { Avatar, Button } from '@nextui-org/react'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { API_URL } from '../../http'
import { Context } from '../../main'
import { observer } from 'mobx-react-lite'
import { FaRepeat } from 'react-icons/fa6'
import { useTranslation } from 'react-i18next'

function NotifyElement({ notify }) {
    const { t, i18n } = useTranslation();
    const { store } = useContext(Context)
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const [isFollowed, setIsFollowed] = useState(store.user.follows.find(user => user.userId === notify.sender.senderId))

    useEffect(() => {
        setIsFollowed(store.user.follows.find(user => user.userId === notify.sender.senderId))
    }, [store.user])

    const formatDate = (date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
    
        if (diffInSeconds < 60) {
            return t("timeAgo.lessminute");
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}{t("timeAgo.minutes")}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}{t("timeAgo.hours")}`;
        } else if (now.getFullYear() === date.getFullYear()) {
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}-${day}`;
        } else {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }

    const followUser = async () => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
    
        debounceTimeout.current = setTimeout(async () => {
            await store.followUser(notify.sender.username);
        }, 1000)
    }

    return (
        <div key={notify.time} className="flex flex-row h-auto gap-2 items-center">
            <div>
                <Avatar
                    showFallback
                    src={`${API_URL}profile/picture/${notify.sender.username}`}
                    name={notify.sender.isSender ? notify.sender.username : "SYSTEM"}
                    size="md"
                    className="w-12 h-12 cursor-pointer"
                    onClick={() => window.location = "/p/" + notify.sender.username}
                />
            </div>
            <div className="flex flex-col justify-start items-start">
                <div>
                    <p className="font-bold text-lg">{notify.sender.isSender ? notify.sender.username : "System"}</p>
                </div>
                <div className="flex flex-row gap-1">
                    <p className="text-neutral-400 text-sm text-ellipsis overflow-hidden max-w-48">{notify.content}</p>
                    <p className="text-neutral-500">{formatDate(new Date(notify.time))}</p>
                </div>
                {notify.comment.isComment && notify.comment.content ? (
                    <div>
                        <p className='text-neutral-400 max-w-52 truncate overflow-hidden'>| {store.user.username}: {notify.comment.content}</p>
                    </div>
                ) : (<></>)}
            </div>
            <div className="ml-auto">
                {notify.type === "follow" ? (
                    <Button color={isFollowed ? "default" : "danger"} className='font-bold' onClick={() => store.followUser(notify.sender.username)} startContent={isFollowed ? <FaRepeat /> : <></>}>
                        {isFollowed ? t("notifications.friends") : t("notifications.followback")}
                    </Button>
                ) : notify.video.isVideo ? (
                    <div>
                        <img
                            src={`${API_URL}video/watch/${notify.video.videoId}/thumbnail`} 
                            alt="Video" 
                            className='max-w-12 max-h-16 object-cover cursor-pointer'
                            onClick={() => window.location = "/video/" + notify.video.videoId}
                        />
                    </div>
                ) : (<></>)}
            </div>
        </div>
    )
}

export default observer(NotifyElement);