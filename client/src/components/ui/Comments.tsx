import { Avatar, Button, ButtonGroup, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Context } from '../../main';
import { useTranslation } from 'react-i18next';
import { IoIosSend } from 'react-icons/io';
import { FaChevronDown, FaChevronUp, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { API_URL } from '../../http';

function Comments({ isOpen, setIsOpen, videoId }) {
    const { store } = useContext(Context);
    const { t, i18n } = useTranslation();
    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState([]);
    const [currentActiveReplies, setCurrentActiveReplies] = useState(null);

    const [commentText, setCommentText] = useState("");
    const [activeReply, setActiveReply] = useState(null);
    const [replyText, setReplyText] = useState("");

    const fetchVideoData = async () => {
        const comms = await store.getVideoComments(videoId);
        setComments(comms);
    };

    useEffect(() => {
        console.log(comments);
    }, [comments])

    useEffect(() => {
        fetchVideoData();
    }, [videoId]);

    const handleSendComment = async () => {
        const comment = await store.sendComment(videoId, commentText, false, null);
        setComments(prevComments => [...prevComments, comment[0]]);
        setCommentText("");
    };

    const handleReplyComment = async () => {
        const comment = await store.sendComment(videoId, replyText, true, activeReply);

        setCurrentActiveReplies(activeReply);
        const replies = await store.getVideoComments(videoId, null, activeReply);
        setReplies(replies);
        setActiveReply(null);
        setReplyText("");
    };

    const handleLoadReplies = async (commentId: string) => {
        setReplies([]);
        setCurrentActiveReplies(commentId);
        const replies = await store.getVideoComments(videoId, null, commentId);
        setReplies(replies);
    };

    const handleLikeComment = async (commentId: string) => {
        const [isLiked, likes] = await store.likeComment(videoId, commentId);
        fetchVideoData();
    };

    return (
        <Modal
            isOpen={isOpen}
            size='3xl'
            onClose={() => setIsOpen(false)}
            scrollBehavior="inside"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            {t("comments.title")}
                        </ModalHeader>
                        <ModalBody>
                            <div className='flex flex-col gap-4'>
                                {comments.map((comment) => (
                                    <div key={comment.commentId} className='flex flex-col text-sm'>
                                        <div className='flex flex-col'>
                                            <div className='flex flex-row items-center gap-2'>
                                                <Link to={`/@${comment.authorUsername}`}>
                                                    <div>
                                                        <Avatar
                                                            showFallback
                                                            src={`${API_URL}profile/picture/${comment.authorUsername}`}
                                                            name={comment.authorUsername}
                                                        />
                                                    </div>
                                                </Link>
                                                <div>
                                                    <Link to={`/p/${comment.authorUsername}`}>
                                                        <p className='font-bold'>@{comment.authorUsername}</p>
                                                    </Link>
                                                    <p>{comment.content}</p>
                                                </div>
                                                <div className='ml-auto flex flex-col items-center text-sm transition-colors duration-250 ease-in-out text-neutral-500 hover:text-white'>
                                                    <FaHeart 
                                                        className={`cursor-pointer ${Array.isArray(comment.likes) && comment.likes.find(like => like.userId === store.user.userId) ? "text-red-500" : ""}`}
                                                        size={20}
                                                        onClick={() => handleLikeComment(comment.commentId)} 
                                                    />
                                                    <p>{comment.likes.length}</p>
                                                </div>
                                            </div>
                                            <div className='pl-12'>
                                                <div className='text-neutral-500 flex flex-row gap-4'>
                                                    <p>{timeAgo(comment.time, t)}</p>
                                                    <p 
                                                        className='cursor-pointer'
                                                        onClick={() => setActiveReply(comment.commentId)}
                                                    >
                                                        {t("comments.reply")}
                                                    </p>
                                                </div>
                                            </div>
                                            {comment.replyCount > 0 && currentActiveReplies !== comment.commentId && (
                                                <div className='pl-12 pt-2'>
                                                    <p className='text-neutral-500 cursor-pointer flex flex-row items-center gap-2' onClick={() => handleLoadReplies(comment.commentId)}>
                                                        {t("comments.read")} {comment.replyCount} {comment.replyCount > 1 ? t("comments.replies") : t("comments.reply").toLowerCase()} <FaChevronDown className='mt-1' />
                                                    </p>
                                                </div>
                                            )}
                                            {currentActiveReplies === comment.commentId && replies.map(reply => (
                                                <div className='pl-12 pt-2 flex flex-col ' key={reply.commentId}>
                                                    <div className='flex flex-row items-center gap-2'>
                                                        <Link to={`/${reply.authorUsername}`}>
                                                            <div>
                                                                <Avatar
                                                                    showFallback
                                                                    src={`${API_URL}profile/picture/${reply.authorUsername}`}
                                                                    name={reply.authorUsername}
                                                                />
                                                            </div>
                                                        </Link>
                                                        <div>
                                                            <Link to={`/${reply.authorUsername}`}>
                                                                <p className='font-bold'>@{reply.authorUsername}</p>
                                                            </Link>
                                                            <p>{reply.content}</p>
                                                        </div>
                                                        <div className='ml-auto flex flex-col items-center text-sm transition-colors duration-250 ease-in-out text-neutral-500 hover:text-white'>
                                                            <FaHeart
                                                                className={`cursor-pointer ${Array.isArray(reply.likes) && reply.likes.find(like => like.userId === store.user.userId) ? "text-red-500" : ""}`}
                                                                size={20}
                                                                onClick={() => handleLikeComment(reply.commentId)}
                                                            />
                                                            <p>{reply.likes.length}</p>
                                                        </div>
                                                    </div>
                                                    <div className='pl-12'>
                                                        <div className='text-neutral-500 flex flex-row gap-4'>
                                                            <p>{timeAgo(reply.time, t)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {activeReply === comment.commentId && (
                                                <ButtonGroup
                                                    className='w-full mt-2'
                                                >
                                                    <Input
                                                        size='sm'
                                                        placeholder={t("comments.writereply")}
                                                        value={replyText}
                                                        onChange={(event) => {
                                                            if (event.target.value.length < 128)
                                                                setReplyText(event.target.value)
                                                            else return false
                                                        }}
                                                        classNames={{
                                                            inputWrapper: "rounded-l-md rounded-r-none"
                                                        }}
                                                    />
                                                    <Button 
                                                        size='sm' 
                                                        isIconOnly
                                                        startContent={<IoIosSend/> }
                                                        onClick={handleReplyComment}
                                                    />
                                                </ButtonGroup>
                                            )}
                                            {currentActiveReplies === comment.commentId && (
                                                <div className='ml-auto mt-2'>
                                                    <p 
                                                        className='flex flex-row items-center gap-2 transition-colors duration-250 ease-in-out text-neutral-500 hover:text-white cursor-pointer'
                                                        onClick={() => {
                                                            setCurrentActiveReplies("");
                                                            setReplies([]);
                                                        }}
                                                    >
                                                        {t("comments.hide")} <FaChevronUp />
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <ButtonGroup
                                className='w-full'
                            >
                                <Input
                                    placeholder={t("comments.writecomment")}
                                    size='md'
                                    value={commentText}
                                    onChange={(event) => {
                                        if (event.target.value.length < 128)
                                            setCommentText(event.target.value)
                                        else return false
                                    }}
                                    classNames={{
                                        inputWrapper: "rounded-l-md rounded-r-none"
                                    }}
                                />
                                <Button 
                                    size='md' 
                                    isIconOnly 
                                    startContent={<IoIosSend/> }
                                    onClick={handleSendComment}
                                />
                            </ButtonGroup>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

function timeAgo(date, t) {
    const now = new Date();
    const diff = now - new Date(date);

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
        return `${seconds}${t("timeAgo.seconds")}`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}${t("timeAgo.minutes")}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}${t("timeAgo.hours")}`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return `${days}${t("timeAgo.days")}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months}${t("timeAgo.months")}`;
    }

    const years = Math.floor(months / 12);
    return `${years}${t("timeAgo.years")}`;
}

export default Comments