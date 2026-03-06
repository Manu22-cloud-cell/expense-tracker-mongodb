const express = require('express');
const router = express.Router();
const passwordController = require("../controller/passwordController");


router.post("/forgotpassword", passwordController.forgotPassword);
router.get("/resetpassword/:id", passwordController.resetPasswordPage);
router.post("/updatepassword/:id", passwordController.updatePassword);


module.exports = router;

