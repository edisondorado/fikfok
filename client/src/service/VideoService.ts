import { AxiosResponse } from "axios";
import $api from "../http";
import { IVideo } from "../models/IVideo";

export default class AuthService {
    static async getUserVideos(username: string, profileVideoIndex: number, filter: "likes" | "favorites" | "reposts"): Promise<AxiosResponse<IVideo>> {
        return $api.get(`/video/profile/${username}/videos?videoIndex=${profileVideoIndex}&filter=${filter}`);
    }
    static async getUserProfileVideos(username: string, tab: "videos" | "favorites" | "likes" | "reposts"): Promise<AxiosResponse<String>> {
        return $api.get(`/video/profile/${username}/videos?tab=${tab}`);
    }
    static async likeVideo(videoId: string): Promise<AxiosResponse<String>>{
        return $api.put(`/video/watch/${videoId}/like`);
    }

    static async favoriteVideo(videoId: string): Promise<AxiosResponse<String>>{
        return $api.put(`/video/watch/${videoId}/favorite`);
    }

    static async getVideoComments(videoId: string, lastCommentId: string, messageId: string): Promise<AxiosResponse<String>>{
        return $api.post(`/video/watch/${videoId}/comments`, { lastCommentId, messageId });
    }

    static async sendComment(videoId: string, content: string, isReply: boolean, commentId: string): Promise<AxiosResponse<String>> {
        return $api.post(`/video/watch/${videoId}/comment`, { content, isReply, commentId });
    }

    static async likeComment(videoId: string, commentId: string): Promise<AxiosResponse<String>>{
        return $api.put(`/video/watch/${videoId}/comment/${commentId}/like`);
    }

    static async getLikedComments(videoId: string): Promise<AxiosResponse<String>> {
        return $api.get(`/video/watch/${videoId}/likedcomments`)
    }

    static async repostVideo(videoId: string, isProfileRepost: boolean): Promise<AxiosResponse<String>> {
        return $api.put(`/video/watch/${videoId}/repost`, { isProfileRepost });
    }

    static async getRandomVideo(currentVideoId: string): Promise<AxiosResponse<String>> {
        return $api.get(`/video/random`, { currentVideoId });
    }

    static async getVideo(videoId: string): Promise<AxiosResponse<IVideo>> {
        return $api.get(`/video/data/${videoId}`)
    }
}