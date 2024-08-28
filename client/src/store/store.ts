import { makeAutoObservable, runInAction } from "mobx";
import { IUser } from "../models/IUser";
import AuthService from "../service/AuthService";
import VideoService from "../service/VideoService";
import axios from "axios";
import { AuthResponse } from "../models/response/AuthResponse";
import { API_URL } from "../http";
import UserService from "../service/UserService";
import toast from "react-hot-toast";

export default class Store {
    user = {} as IUser;
    isAuth = null;
    isLoading = true;

    constructor() {
        makeAutoObservable(this);
    }

    setAuth(bool: boolean){
        this.isAuth = bool;
    }

    setUser(user: IUser) {
        this.user = user;
    }

    setLoading(bool: boolean) {
        this.isLoading = bool;
    }

    async login(email: string, password: string){
        try {
            const response = await AuthService.login(email, password);
            localStorage.setItem("token", response.data.accessToken);

            this.setAuth(true);
            this.setUser(response.data.user);
        } catch(e){
            if (e.response?.data?.message) toast.error(e.response.data.message);
            console.warn(e.response?.data?.message);
        }    
    }

    async register(email: string, password: string, username: string){
        try {
            const response = await AuthService.register(email, password, username);
            localStorage.setItem("token", response.data.accessToken);

            this.setAuth(true);
            this.setUser(response.data.user);
        } catch(e){
            console.warn(e.response?.data?.message);
        }    
    }

    async getUserVideos(username: string, profileVideoIndex: number, filter: string) {
        try {
            const response = await VideoService.getUserVideos(username, profileVideoIndex, filter);

            return [response.data.video, response.data.totalVideos];
        } catch(e) {
            if (e.response?.data?.message) toast.error(e.response.data.message);
            console.warn(e.response?.data?.message)
        }
    }

    async logout(){
        try {
            const response = await AuthService.logout();
            localStorage.removeItem("token");

            this.setAuth(false);
            this.setUser({} as IUser);
        } catch(e){
            console.warn(e.response?.data?.message);
        }
    }

    async followUser(username: string) {
        try {
            await UserService.followUser(username);
            await this.checkAuth();
        } catch(e) {
            console.error(e);
            console.warn(e.response?.data?.message);
        }
    }

    async editProfile(username: string, name: string, description: string, profilePicture: File | null) {
        try {
            if (profilePicture) {
                const formData = new FormData();
                formData.append("file", profilePicture);
                await UserService.editProfilePicture(formData);
            }
            
            await UserService.editProfile(username, name, description);
            if (username !== this.user.username) {
                window.location = `/p/${username}`
            } else {
                window.location.reload();
            }
        } catch(e) {
            if (e.response?.data?.message) toast.error(e.response.data.message);
            console.warn(e.response?.data?.message);
            console.warn(e);
        }
    }

    async checkAuth() {
        this.setLoading(true);
        try {
            const response = await axios.get<AuthResponse>(`${API_URL}auth/refresh`, {withCredentials: true})
            localStorage.setItem("token", response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch(e){
            console.log(e)
            console.warn(e.response?.data?.message);
        } finally {
            this.setLoading(false);
        }
    }

    async loadUserVideos(username, tab) {
        try {
            const response = await VideoService.getUserProfileVideos(username, tab);
            return response.data.video;
        } catch(e) {
            if (e.response?.data?.message) toast.error(e.response.data.message);
            console.warn(e.response?.data?.message);
        }
    }

    async likeVideo(videoId: string) {
        try {
            const response = await VideoService.likeVideo(videoId);

            return [
                response.data.userHasLiked,
                response.data.likes
            ]
        } catch (e) {
            console.warn(e);
            console.warn(e.response?.data?.message);
        } finally {
            await this.checkAuth()
        }
    }

    async getVideoComments(videoId: string, lastCommentId: string, messageId: string) {
        try {
            const response = await VideoService.getVideoComments(videoId, lastCommentId, messageId);
            console.log("VideoComments:", response.data)
            return response.data;
        } catch(e) {
            console.warn(e);
            console.warn(e.response?.data?.message);
        }
    }

    async likeComment(videoId: string, commentId: string) {
        try {
            const response = await VideoService.likeComment(videoId, commentId);

            return [response.data.userHasLiked, response.data.likes]
        } catch(e) {
            console.warn(e);
            console.error(e.response?.data?.message);
        }
    }

    async repostVideo(videoId: string, isProfileRepost: boolean) {
        try {
            const response = await VideoService.repostVideo(videoId, isProfileRepost);

            return response.data.reposts;
        } catch(e) {
            console.warn(e);
            console.warn(e.response?.data?.message);
        } finally {
            await this.checkAuth()
        }
    }

    async getLikedComments(videoId: string) {
        try {
            const response = await VideoService.getLikedComments(videoId);

            return response.data;
        } catch(e) {
            console.warn(e);
            console.warn(e.response?.data?.message);
        }
    }

    async getNotifications() {
        try {
            const response = await UserService.getNotifications();

            return [response.data.new, response.data.old];
        } catch(e) {
            if (e.response?.data?.message) toast.error(e.response.data.message);
            console.warn(e.response?.data?.message);
        }
    }

    async sendComment(videoId: string, commentText: string, isReply: boolean, commentId: string) {
        try {
            const response = await VideoService.sendComment(videoId, commentText, isReply, commentId);

            return [response.data.comment];
        } catch(e) {
            console.warn(e);
            console.warn(e.response?.data?.message);
        }
    }

    async favoriteVideo(videoId: string){
        try {
            const response = await VideoService.favoriteVideo(videoId);

            return [
                response.data.hasAlreadyFavorited,
                response.data.favorites
            ]
        } catch(e) {
            console.warn(e.response?.data?.message);
        } finally {
            await this.checkAuth()
        }
    }

    async getRandomVideo(currentVideoId: string) {
        try {
            const response = await VideoService.getRandomVideo(currentVideoId);
            
            return response.data;
        } catch(e){
            console.warn(e.response?.data?.message);
        }
    }

    async getVideo(videoId: string) {
        try {
            const response = await VideoService.getVideo(videoId);

            return response.data;
        } catch(e) {
            console.warn(e.response?.data?.message);
        }
    }

    async userProfilePicture() {
        if (this.isAuth) {
            return `localhost:3001/profile/picture/${this.user.username}`
        }
    }

    async getUserProfile(username: string) {
        try {
            const response = await UserService.getUser(username);

            return response.data;
        } catch(e) {
            console.warn(e.response?.data?.message);
        }
    }
}