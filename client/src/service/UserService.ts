import { AxiosResponse } from "axios";
import $api from "../http";
import { IUser } from "../models/IUser";

export default class UserService {
    static getUser(username: string): Promise<AxiosResponse<IUser>> {
        return $api.get<IUser>(`/profile/get/${username}`);
    }

    static async followUser(username: string): Promise<AxiosResponse<String>> {
        return $api.put(`/profile/get/${username}/follow`)
    }

    static async editProfilePicture(formData: FormData): Promise<AxiosResponse<String>> {
        return $api.post(`/profile/update_picture`, formData)
    }

    static async editProfile(username: string, name: string, description: string) {
        return $api.put(`/profile/update`, {username, name, description})
    }

    static async getNotifications() {
        return $api.get("/profile/notifications")
    }
}