const mysql = require('mysql');
const connection = require('../database/connection');

const localhost = '47.100.101.113'
const port = 3000;

// 處理上傳頭像請求
exports.uploadAvatar = (req, res) => {
  // 實現上傳頭像邏輯
  const { uid } = req.body; // 假設從前端傳過來用戶ID
  // 獲取上傳的文件名
  const fileName = req.fileName;
  const avatarUrl = `http://${localhost}:${port}/uploads/avatars/${uid}/${fileName}`;
  // 更新用戶的頭像URL到數據庫
  connection.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, uid], (error, results) => {
    if (error) {
      res.status(500).send('Internal Server Error');
      // 把錯誤發給前端
      res.json({ error: error });
    } else {
      res.status(200).send('Avatar uploaded successfully');
    }
  });
};
