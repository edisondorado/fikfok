import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Link, Input, ButtonGroup, useDisclosure, Checkbox, Avatar, Divider, DropdownSection, Skeleton, Popover, PopoverTrigger, PopoverContent, RadioGroup, Radio } from "@nextui-org/react";

import { IoHome, IoLogOutOutline, IoMenu } from "react-icons/io5";
import { FaChevronLeft, FaCog, FaCompass, FaDesktop, FaLanguage, FaMoon, FaRegBookmark, FaRegUser, FaSun } from "react-icons/fa";
import { HiUserAdd } from "react-icons/hi";
import { IoMdSearch, IoMdNotificationsOutline } from "react-icons/io";
import { FiMessageSquare } from "react-icons/fi";

import LogoDark from "../assets/Logo_Dark.png";
import LogoLight from "../assets/Logo.png";

import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import AuthService from "../service/AuthService";
import GeoService from "../service/GeoService";
import { Context } from "../main";
import { observer } from "mobx-react-lite"
import useDarkMode from "use-dark-mode";

import "../i18n"
import { useTranslation } from "react-i18next";
import AuthModal from "../components/AuthModal";
import { API_URL } from "../http";
import NotifyElement from "../components/ui/NotifyElement";

const NavBar = () => {
    const { store } = useContext(Context)

    const { t, i18n } = useTranslation();

    const darkMode = useDarkMode();
    
    const [isOpenAuth, setIsOpenAuth] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [location, setLocation] = useState();
    const [selectedFilter, setSelectedFilter] = useState("all");

    const [profileMenuSelected, setProfileMenuSelected] = useState("");
    const [oldNotifications, setOldNotifications] = useState([]);
    const [newNotifications, setNewNotifications] = useState([]);

    const onOpenAuth = () => {
        setIsOpenAuth(true);
    }

    const profileMenu = [
        {icon: FaRegUser, key: "profile", closeOnSelect: true, onClick: () => window.location = `/p/${store.user.username}`},
        {icon: FaRegBookmark, key: "favorites", closeOnSelect: true, onClick: () => window.location = "/favorites"},
        {icon: FaLanguage, key: "language", closeOnSelect: false, onClick: () => setProfileMenuSelected("language")},
        {icon: darkMode.value ? FaMoon : !darkMode.value ? FaSun : FaDesktop, key: "theme", closeOnSelect: false, onClick: () => setProfileMenuSelected("theme")},
        {icon: FaCog, key: "settings", closeOnSelect: false, onClick: () => window.location = "/settings"},
    ]

    const themeMenu = [
        {icon: FaSun, key: "light_theme", onClick: () => darkMode.disable()},
        {icon: FaMoon, key: "dark_theme", onClick: () => darkMode.enable()},
        {icon: FaDesktop, key: "system_theme", onClick: () => changeThemeSystem()}
    ]
    
    const menuItems = [
        {icon: IoHome, key: "foryou", doesShow: true, link: "/"},
        {icon: FaCompass, key: "explore", doesShow: true, link: "/explore"},
        {icon: HiUserAdd, key: "friends", doesShow: store.isAuth, link: "/friends"},
    ];

    const languages = [
        {key: "en-US", value: "English"},
        {key: "ko-KR", value: "한국인"},
        {key: "ru-RU", value: "Русский"},
    ]

    const nofiticationFilters = [
        {key: "all"},
        {key: "likes"},
        {key: "comments"},
        {key: "mentions"},
        {key: "follows"}
    ]
    
    const changeThemeSystem = () => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery.matches) {
            darkMode.enable();
        } else {
            darkMode.disable();
        }
    }

    const fetchNotifications = async () => {
        const [newNotify, oldNotify] = await store.getNotifications();
        setNewNotifications(newNotify);
        setOldNotifications(oldNotify);
    }

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            store.setLoading(false);
        }
    }, [])

    return (
        <div className="dark:bg-[#121212] bg-white flex items-center justify-between p-2 z-50">
            <div className="flex items-center space-x-4">
                <Dropdown size="lg">
                    <DropdownTrigger>
                        <Button 
                            variant="bordered"
                            isIconOnly
                        >
                            <IoMenu />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions">
                        {menuItems.map((item) => {
                            if (!item.doesShow) return null;
                            return (
                                <DropdownItem key={item.key} startContent={<item.icon />} onClick={() => {
                                    window.location = item.link
                                }}>
                                    {t(`menu.${item.key}`)}
                                </DropdownItem>
                            )
                        })}
                    </DropdownMenu>
                </Dropdown>
                <div>
                    <img src={LogoDark} alt="FikFok" className="dark:block hidden cursor-pointer" onClick={() => window.location = "/"} />
                    <img src={LogoLight} alt="FikFok" className="block dark:hidden cursor-pointer" onClick={() => window.location = "/"} />
                </div>
            </div>
            <div className="flex-1 mx-4 flex justify-center items-center">
                <ButtonGroup className="w-[25%]">
                    <Input 
                        placeholder={t("search")}
                        radius="full"
                        endContent={
                            <IoMdSearch className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                        }
                    />
                </ButtonGroup>
            </div>
            <div className="flex items-center space-x-4">
                <Button isIconOnly startContent={<FiMessageSquare />} variant="flat" />
                <Popover onOpenChange={fetchNotifications} placement="bottom-end" className="w-96" classNames={{ content: [ "items-start" ] }}>
                    <PopoverTrigger>
                        <Button isIconOnly startContent={<IoMdNotificationsOutline />} variant="flat" />
                    </PopoverTrigger>
                    <PopoverContent className="gap-2">
                        <div className="flex flex-col items-start justify-start">
                            <p className="text-xl font-bold self-start">{t("navbar.notifications")}</p>
                        </div>
                        <div className="flex flex-row flex-wrap gap-2">
                            {nofiticationFilters.map(filter => (
                                <Button key={filter.key} size="sm" radius="full" className={`h-6 font-bold ${selectedFilter === filter.key ? "dark:bg-white dark:text-black bg-black text-white" : ""}`} onClick={() => setSelectedFilter(filter.key)}>
                                    {t(`notifications.${filter.key}`)}
                                </Button>
                            ))}
                        </div>
                        <div className="w-full">
                            <div className={newNotifications.length > 0 ? "block" : "hidden"}>
                                <p className="text-neutral-500 dark:text-neutral-400 text-md font-semibold">{t("notifications.new")}</p>
                                <div className="flex flex-col gap-2">
                                    {newNotifications.map(notify => (
                                        <NotifyElement notify={notify} />
                                    ))}
                                </div>
                            </div>
                            <div className={oldNotifications.length > 0 ? "block" : "hidden"}>
                                <p className="text-neutral-500 dark:text-neutral-400 text-md font-semibold">{t("notifications.prev")}</p>
                                <div className="flex flex-col gap-2">
                                    {oldNotifications.map(notify => (
                                        <NotifyElement notify={notify} />
                                    ))}
                                </div>
                            </div>
                            {newNotifications.length < 1 && oldNotifications.length < 1 ? (
                                <div>
                                    <p className="text-neutral-500">{t("navbar.nonotifications")}</p>
                                </div>
                            ): (<></>)}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center pl-6">
                {store.isAuth ? (
                    <div className="relative w-10 h-10 overflow-hidden rounded-full">
                        <Dropdown size="lg" closeOnSelect={false}>
                            <DropdownTrigger>
                                <Avatar 
                                    className="cursor-pointer" 
                                    showFallback 
                                    src={`${API_URL}profile/picture/${store.user.username}`} 
                                    name={store.user.username}
                                    onClick={() => setProfileMenuSelected("menu")}
                                />
                            </DropdownTrigger>
                            {
                                profileMenuSelected === "theme" ? (
                                    <DropdownMenu aria-label="Theme menu">
                                        <DropdownSection>
                                            <DropdownItem key="back" startContent={<FaChevronLeft />} onClick={() => setProfileMenuSelected("menu")}>
                                                {t("back")}
                                            </DropdownItem>
                                            {themeMenu.map(item => (
                                                <DropdownItem key={item.key} startContent={<item.icon/>} onClick={item.onClick}>
                                                    {t(`theme.${item.key}`)}
                                                </DropdownItem>
                                            ))}
                                        </DropdownSection>
                                    </DropdownMenu>
                                ) : profileMenuSelected === "language" ? (
                                    <DropdownMenu aria-label="Language menu">
                                        <DropdownSection>
                                            <DropdownItem key="back" startContent={<FaChevronLeft />} onClick={() => setProfileMenuSelected("menu")}>
                                                {t("back")}
                                            </DropdownItem>
                                            {languages.map(item => (
                                                <DropdownItem key={item.key} closeOnSelect className={i18n.language === item.key ? "text-neutral-600" : "text-white"} isReadOnly={i18n.language === item.key} onClick={() => i18n.changeLanguage(item.key)}>
                                                    {item.value}
                                                </DropdownItem>
                                            ))}
                                        </DropdownSection>
                                    </DropdownMenu>
                                ) : (
                                    <DropdownMenu aria-label="Profile menu">
                                        <DropdownSection showDivider>
                                            {profileMenu.map(item => (
                                                <DropdownItem key={item.key} closeOnSelect={item.closeOnSelect} onClick={item.onClick} startContent={<item.icon/>}>
                                                    {t(`profileMenu.${item.key}`)}
                                                </DropdownItem>
                                            ))}
                                        </DropdownSection>
                                        <DropdownSection>
                                            <DropdownItem key="logout" startContent={<IoLogOutOutline />} onClick={store.logout}>
                                                {t("profileMenu.logout")}
                                            </DropdownItem>
                                        </DropdownSection>
                                    </DropdownMenu>
                                )
                            }
                        </Dropdown>
                    </div>
                ) : store.isLoading ? (
                    <Skeleton className="flex rounded-full w-10 h-10"/>
                ) : (
                    <div className="flex gap-2">
                        <Dropdown size="lg" closeOnSelect={false}>
                            <DropdownTrigger>
                                <Button startContent={<FaLanguage />} key="language" isIconOnly variant="bordered" />
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Language menu">
                                <DropdownSection>
                                    {languages.map(item => (
                                        <DropdownItem key={item.key} closeOnSelect className={i18n.language === item.key ? "text-neutral-600" : "text-white"} isReadOnly={i18n.language === item.key} onClick={() => i18n.changeLanguage(item.key)}>
                                            {item.value}
                                        </DropdownItem>
                                    ))}
                                </DropdownSection>
                            </DropdownMenu>
                        </Dropdown>
                        <Button
                            className="font-bold"
                            color="danger"
                            onClick={onOpenAuth}
                        >
                            {t("signup")}
                        </Button>
                    </div>
                )}
            </div>
            <AuthModal isOpen={isOpenAuth} setIsOpen={setIsOpenAuth} />
        </div>
    )
}

export default observer(NavBar);