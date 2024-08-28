import { AxiosResponse } from "axios";
import $api from "../http";
import { AuthResponse } from "../models/response/AuthResponse";

export default class AuthService {
    static async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>("/auth/signin", { email, password });
    }

    static async register(email: string, password: string, username: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>("/auth/signup", { email, password, username });
    }

    static async logout(): Promise<void> {
        return $api.post("/auth/signout");
    }
}