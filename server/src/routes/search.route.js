const searchController = require('../controllers/search.controller');

const router = require('express').Router();

router.get("/all", searchController.findAll);
router.get("/profile", searchController.findProfile);
router.get("/video", searchController.findVideo);

module.exports = router;