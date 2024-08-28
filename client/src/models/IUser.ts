import { TUser } from "./TUser";
import { TVideo } from "./TVideo";
import { UserPrivate } from "./UserPrivate";

export interface IUser {
    userId: string;
    isActivated: boolean;
    name: string;
    username: string;
    description: string;
    allowToMessage: string;
    profilePicture: string;
    follows: [TUser];
    followers: [TUser];
    private: UserPrivate;
    likedVideos: [TVideo];
    repostedVideos: [TVideo];
    likes: number;
}