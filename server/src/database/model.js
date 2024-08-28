const mongoose = require("mongoose");
const { getNames, getCode } = require("country-list");
const { notificationTypes } = require("../config/notifications");

const validateCountry = (value) => {
    const countryCodes = getNames().map(name => getCode(name));
    return countryCodes.includes(value);
}

const TUserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true, 
        sparse: true
    },
    time: {
        type: Date,
        default: Date.now()
    }
})

const TVideoSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now()
    }
})


const UserSchema = mongoose.model("User", new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    description: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    allowToMessage: {
        type: String,
        enum: ["everyone", "friends", "no one"],
        required: true,
        default: "everyone"
    },
    private: {
        isProfilePrivate: {
            type: Boolean,
            required: true,
            default: false
        },
        isLikedVideosPrivate: {
            type: Boolean,
            required: true,
            default: true
        },
        isRepostedVideosPrivate: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    region: {
        type: String,
        required: true,
        validate: {
            validator: validateCountry,
            message: props => `${props.value} is not a valid country code`
        }
    },
    follows: [TUserSchema],
    followers: [TUserSchema],
    favorites: [TVideoSchema],
    likedVideos: [TVideoSchema],
    seenVideos: [TVideoSchema],
    repostedVideos: [TVideoSchema],
    activation: {
        link: String,
        isActivated: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }
}));

const VideoSchema = mongoose.model("Video", new mongoose.Schema({
    videoId: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        ref: "User",
        required: true
    },
    name: String,
    views: [TUserSchema],
    schedule: {
        date: {
            type: Date,
            default: Date.now()
        },
        isSchedule: {
            type: Boolean,
            default: false
        },
        visibility: {
            type: String,
            required: true,
            enum: ["private", "friends", "everyone"],
            default: "everyone"
        }
    },
    comments: [{
        authorId: {
            type: String,
            ref: "User",
            required: true
        },
        authorUsername: {
            type: String,
            ref: "User",
            required: true
        },
        commentId: {
            type: String,
            unique: true,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        hadEdit: {
            type: Boolean,
            default: false
        },
        time: {
            type: Date,
            default: Date.now()
        },
        reply: {
            isReply: {
                type: Boolean,
                default: false
            },
            commentId: String
        },
        likes: [TUserSchema]
    }],
    commentsAllowed: {
        type: Boolean,
        default: true
    },
    time: {
        type: Date,
        default: Date.now()
    },
    duration: {
        type: Number,
        required: true
    },
    likes: [TUserSchema],
    isPinned: {
        type: Boolean,
        default: false
    },
    favorites: [TUserSchema],
    reposts: [TUserSchema],
    visibility: {
        type: String,
        required: true,
        enum: ["private", "friends", "everyone"],
        default: "everyone"
    }
}));

const MessageSchema = mongoose.model("Message", new mongoose.Schema({
    messageId: {
        type: String,
        unique: true,
        required: true
    },
    senderId: {
        type: String,
        ref: "User",
        required: true
    },
    receiverId: {
        type: String,
        ref: "User",
        required: true
    },
    time: {
        type: Date,
        default: Date.now()
    },
    content: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    repost: {
        isRepost: {
            type: Boolean,
            required: true,
            default: false
        },
        videoId: {
            type: String,
            ref: "Video",
            required: true
        }
    }
}));

const NotificationSchema = mongoose.model("Notification", new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: notificationTypes
    },
    userId: {
        type: String,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true,
        default: Date.now
    },
    video: {
        isVideo: {
            type: Boolean,
            required: true,
            default: false
        },
        videoId: {
            type: String,
            ref: "Video",
        }
    },
    comment: {
        isComment: {
            type: Boolean,
            required: true,
            default: false
        },
        commentId: String,
    },
    sender: {
        isSender: {
            type: Boolean,
            requird: true,
            default: false
        },
        senderId: {
            type: String,
            ref: "User"
        }
    },
    system: {
        isSystem: {
            type: Boolean,
            required: true,
            default: false
        },
        name: String
    }
}));

const TokenSchema = mongoose.model("Token", new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        ref: "User",
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
}));

module.exports = { UserSchema, VideoSchema, MessageSchema, NotificationSchema, TokenSchema };