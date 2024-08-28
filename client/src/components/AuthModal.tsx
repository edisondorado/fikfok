import React, { useContext, useEffect, useMemo, useState } from 'react'
import GeoService from "../service/GeoService"
import { Context } from '../main';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs, useDisclosure } from '@nextui-org/react';

interface stateAuthorization{
    [key: string]: "singup" | "signin" 
}

const AuthModal = ({ isOpen, setIsOpen }) => {
    const [selectedAuth, setSelectedAuth] = useState<stateAuthorization>("signup");

    const { store } = useContext(Context)
    
    const { t, i18n } = useTranslation();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [location, setLocation] = useState("");

    const authButton = async () => {
        setIsOpen(false);
        if (selectedAuth === "signup") {
            store.register(email, password, username);
        } else {
            store.login(email, password);
        }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            authButton();
        }
    }
    
    const validateEmail = (value) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
    const isInvalidEmail = useMemo(() => {
        if (email === "") return false;

        return validateEmail(email) ? false : true;
    })
    
    const isInvalidPassword = useMemo(() => {
        if (password === "") return false;

        if (confirmPassword !== password) return true;
    })

    useEffect(() => {
        const fetchCountry = async () => {
            const userCountry = await GeoService();
            setLocation(userCountry)
        };

        if (localStorage.getItem("token")) {
            store.checkAuth();
        }

        fetchCountry();
    }, [])

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onKeyDown={handleKeyDown}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <form>
                            <ModalHeader>{selectedAuth === "signup" ? t("auth.signup") : t("auth.signin")}</ModalHeader>
                            <ModalBody>
                                <Tabs
                                    aria-label='Authorizaiton'
                                    selectedKey={selectedAuth}
                                    onSelectionChange={setSelectedAuth}
                                    fullWidth
                                >
                                    <Tab key="signup" title={t("signup")}>
                                        <div className='flex flex-col gap-2'>
                                            <Input
                                                type="email"
                                                label={t("auth.labelEmail")}
                                                isInvalid={isInvalidEmail}
                                                color={isInvalidEmail ? "danger" : "default"}
                                                errorMessage={t("auth.errorEmail")}
                                                value={email}
                                                onChange={(event) => setEmail(event?.target.value)}
                                                placeholder={t("auth.placeholderEmail")}
                                            />
                                            <Input
                                                type="text"
                                                label={t("auth.labelUsername")}
                                                value={username}
                                                onChange={(event) => setUsername(event?.target.value)}
                                                placeholder={t("auth.placeholderUsername")}
                                            />
                                            <Input 
                                                type="password"
                                                label={t("auth.labelPassword")}
                                                value={password}
                                                onChange={(event) => setPassword(event?.target.value)}
                                                placeholder={t("auth.placeholderPassword")}
                                            />
                                            <Input
                                                type="password"
                                                label={t("auth.labelConfirmPassword")}
                                                value={confirmPassword}
                                                onChange={(event) => setConfirmPassword(event?.target.value)}
                                                isInvalid={isInvalidPassword}
                                                color={isInvalidPassword ? "danger" : "default"}
                                                errorMessage={t("auth.errorConfirmPassword")}
                                                placeholder={t("auth.placeholderConfirmPassword")}

                                            />
                                            <Checkbox
                                                defaultSelected
                                            >
                                                <p className="text-sm">
                                                    {t("auth.accountUpdate")}
                                                </p>
                                            </Checkbox>
                                            <p className="text-sm text-neutral-400 flex gap-1">{t("auth.accountLocation")} <span className="text-white">{location}</span></p>
                                        </div>
                                    </Tab>
                                    <Tab key="signin" title={t("signin")}>
                                        <div className='flex flex-col gap-2'>
                                            <Input
                                                type="email"
                                                label={t("auth.labelEmail")}
                                                value={email}
                                                onChange={(event) => setEmail(event?.target.value)}
                                                placeholder={t("auth.placeholderEmail")}
                                            />
                                            <Input 
                                                type="password"
                                                label={t("auth.labelPassword")}
                                                value={password}
                                                onChange={(event) => setPassword(event?.target.value)}
                                                placeholder={t("auth.placeholderPassword")}
                                            />

                                            {/* TODO: Add function for resetting password */}
                                            <div className="flex justify-end">
                                                <p 
                                                    className="text-neutral-400 cursor-pointer text-[12px]"
                                                >
                                                    {t("auth.QForgotPassword")}
                                                </p>
                                            </div>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    {t("auth.cancel")}
                                </Button>
                                {/* TODO: autoclicking primary button by pressing Enter */}
                                <Button color="primary" onPress={() => authButton(onClose)}>
                                    {t("auth.next")}
                                </Button>
                            </ModalFooter>
                        </form>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default AuthModal