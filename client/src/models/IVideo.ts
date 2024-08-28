export interface IVideo{
    videoId: string;
    name: string;
    authorId: string;
    authorName: string;
    views: number;
    commentsAllowed: boolean;
    comments: number;
    time: Date;
    likes: number;
    isPinned: boolean;
    favorites: number;
    reposts: number;
    visibility: string;
}