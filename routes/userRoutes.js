const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 定義路由
router.post('/info', userController.getUserInfo);
router.post('/search_logoff', userController.searchLogoff);
router.post('/restore', userController.restoreUser);
router.post('/likes', userController.userLikes)

module.exports = router;
