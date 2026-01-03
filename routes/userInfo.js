const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const userInfoController = require("../controllors/userInfo");

const {isLoggedIn, isRealOwner} = require("../middleware.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.put("/:id", isLoggedIn, isRealOwner, upload.single('user[image]'), wrapAsync(userInfoController.updateProfilePhoto));

router.get("/:id/profile", isLoggedIn, wrapAsync(userInfoController.profile));

router.get("/:id/profile/edit", isLoggedIn, wrapAsync(userInfoController.editProfile));

module.exports = router;