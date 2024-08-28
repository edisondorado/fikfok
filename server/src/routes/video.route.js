const videoController = require('../controllers/video.controller');
const ApiError = require('../exceptions/api-error');
const authMiddleware = require('../middleware/auth-middleware');
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

const router = require('express').Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/profile/videos');
    },
    filename: function (req, file, cb) {
      const uuid = uuidv4();
      const extension = file.originalname.split('.').pop();
      cb(null, `${uuid}.${extension}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 * 1024,
    },
    fileFilter: function (req, file, cb) {
      if (!file.originalname.match(/\.(mp4|mov|avi|mkv)$/)) {
        return cb(ApiError.BadRequest('Only video files are allowed!'));
      }
      cb(null, true);
    }
});
  

router.get("/watch/:videoId", videoController.getVideo);
router.put("/watch/:videoId/like", authMiddleware, videoController.likeVideo);
router.post("/watch/:videoId/comments", videoController.getComments);
router.post("/watch/:videoId/comment", authMiddleware, videoController.commentVideo);
router.put("/watch/:videoId/favorite", authMiddleware, videoController.favoriteVideo);
router.put("/watch/:videoId/repost", authMiddleware, videoController.repostVideo);
router.delete("/watch/:videoId/delete", authMiddleware, videoController.deleteVideo);
router.get("/watch/:videoId/thumbnail", videoController.getThumbnail);

router.put("/watch/:videoId/comment/:commentId/like", authMiddleware, videoController.likeComment);
router.get("/watch/:videoId/likedcomments", authMiddleware, videoController.getLikedComments);

router.get("/data/:videoId", videoController.getVideoData);
router.get("/profile/:username/videos", videoController.getUserVideo)
router.post("/upload", authMiddleware, upload.single("video"), videoController.uploadVideo);
router.get("/random", videoController.getRandomVideo);

module.exports = router;