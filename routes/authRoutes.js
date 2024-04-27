const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logoff', authController.logoff);
router.post('/send_code', authController.sendVerificationCode);
router.post('/verify_code', authController.verifyCode);

module.exports = router;
