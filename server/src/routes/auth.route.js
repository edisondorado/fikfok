const router = require("express").Router();
const { body } = require("express-validator");

const authController = require("../controllers/auth.controller");

router.post("/signup",
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ max: 64 }).withMessage("Password cannot be more than 64 characters"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
    authController.signup);
router.post("/signin", authController.signin);
router.post("/signout", authController.signout);
router.get("/activate/:link", authController.activate);
router.get("/refresh", authController.refresh);

module.exports = router;