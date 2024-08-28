import { UserResponse } from "./UserResponse";

export interface AuthResponse{
    accessToken: string;
    refreshToken: string;
    user: UserResponse;
}