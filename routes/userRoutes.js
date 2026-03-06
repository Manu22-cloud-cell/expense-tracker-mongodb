const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');


router.post('/signUp', userController.userSignUp);
router.post('/login', userController.userLogin);
router.post('/logout',userController.userLogout);

module.exports = router;