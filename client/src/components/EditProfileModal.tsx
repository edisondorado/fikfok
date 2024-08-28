import React, { useContext, useEffect, useMemo, useState } from 'react'
import GeoService from "../service/GeoService"
import { Context } from '../main';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Checkbox, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs, Textarea, useDisclosure } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import { API_URL } from '../http';
import { useNavigate } from 'react-router-dom';

const EditProfileModal = ({ isOpen, setIsOpen }) => {
    const { store } = useContext(Context)
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePictureFile, setProfilePictureFile] = useState(null);

    const { t, i18n } = useTranslation();

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            handleEditProfile();
        }
    }

    useEffect(() => {
        setUsername(store.user.username);
        setName(store.user.name);
        setDescription(store.user.description);
    }, [store.user])

    const handleUploadImage = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfilePicture(imageUrl)
            setProfilePictureFile(file);
        }
    }

    const handleEditProfile = async () => {
        setIsOpen(false);
        await store.editProfile(username, name, description, profilePictureFile)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onKeyDown={handleKeyDown}
            size='2xl'
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>{t("profile.editprofile")}</ModalHeader>
                        <ModalBody>
                            <div className='flex flex-col gap-4'>
                                <div className='flex flex-row gap-12'>
                                    <div className='w-[20%]'>
                                        {t("profile.pfp")}
                                    </div>
                                    <div className='flex-1'>
                                        <Avatar
                                            className="w-32 h-32 cursor-pointer"
                                            showFallback
                                            size='lg'
                                            src={profilePicture === null ? `${API_URL}profile/picture/${store.user.username}` : profilePicture}
                                            name={store.user.username}
                                            onClick={() => document.getElementById('profilePictureUpload')?.click()}
                                        />
                                        <input 
                                            type='file'
                                            id='profilePictureUpload'
                                            className='hidden'
                                            onChange={handleUploadImage}
                                        />
                                    </div>
                                </div>
                                <Divider />
                                <div className='flex flex-row w-full'>
                                    <div className='w-[20%]'>
                                        {t("profile.username")}
                                    </div>
                                    <div className='flex flex-col text-sm gap-4 flex-1'>
                                        <Input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                        <p className='text-neutral-500'>{window.location.origin}/p/{username}</p>
                                        <p className='text-neutral-500'>{t("profile.username_warning")}</p>
                                    </div>
                                </div>
                                <Divider />
                                <div className='flex flex-row w-full'>
                                    <div className='w-[20%]'>
                                        {t("profile.name")}
                                    </div>
                                    <div className='flex flex-col text-sm gap-4 flex-1'>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                        <p className='text-neutral-500'>{t("profile.name_warning")}</p>
                                    </div>
                                </div>
                                <Divider />
                                <div className='flex flex-row w-full'>
                                    <div className='w-[20%]'>
                                        {t("profile.bio")}
                                    </div>
                                    <div className='flex flex-col text-sm gap-4 flex-1'>
                                        <Textarea 
                                            placeholder={t("profile.writebio")}
                                            value={description}
                                            onChange={(e) => {
                                                if (description && description.length >= 80) {
                                                    return false;
                                                } else {
                                                    setDescription(e.target.value);
                                                }
                                            }}
                                        />
                                        <p className='text-neutral-500'>{description ? description.length : 0}/80</p>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                {t("profile.cancel")}
                            </Button>
                            <Button color="primary" onPress={() => handleEditProfile()}>
                                {t("profile.confirm")}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default observer(EditProfileModal)