const router = require('express').Router();
const multer = require("multer");

const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middleware/auth-middleware');
const ApiError = require('../exceptions/api-error');

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            if (!file.originalname.match(/\.(png|jpg)$/)) {
                return cb(ApiError.BadRequest('This type of image aren\'t supported!'));
            }
            cb(null, true);
        } else {
            cb(ApiError.BadRequest("Invalid file type. Only images are allowed."));
        }
    }
})

router.get("/get/:username", profileController.getProfile);
router.put("/get/:username/follow", authMiddleware, profileController.followProfile);
router.get("/picture/:username", profileController.getUserPicture);
router.get('/notifications', authMiddleware, profileController.getNotifications);
router.put("/update", authMiddleware, profileController.updateProfile);
router.post("/update_picture", authMiddleware, upload.single("file"), profileController.updatePicture);

module.exports = router;