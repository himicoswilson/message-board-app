const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp');
const uploadController = require('../controllers/uploadController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uid = req.body.uid; // 假设用户ID从请求体中获取
    const userAvatarDir = path.join('uploads', 'avatars', uid.toString()); // 用户头像存储路径

    // 创建用户专属头像目录（如果不存在）
    mkdirp(userAvatarDir, (err) => {
      if (err) {
        return cb(err);
      }

      cb(null, userAvatarDir); // 设置文件存储目录为用户专属头像目录
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // 添加唯一后缀防止文件名冲突
    req.fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // 生成新的文件名
  }
});

const upload = multer({ storage });

// 定義路由
router.post('/avatar', upload.any(), uploadController.uploadAvatar);

module.exports = router;
