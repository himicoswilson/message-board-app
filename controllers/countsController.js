const mysql = require('mysql');
const connection = require('../database/connection');

// 處理獲取用戶總數請求
exports.getUsersCount = (req, res) => {
  connection.query('SELECT COUNT(*) AS userCount FROM users WHERE deleted_at IS NULL', (err, result) => {
    if (err) {
      res.status(500).send('Error fetching user count');
    } else {
      res.status(200).json(result[0]);
    }
  });
};

// 處理獲取帖子總數請求
exports.getPostsCount = (req, res) => {
  connection.query('SELECT COUNT(*) AS postCount FROM posts WHERE deleted_at IS NULL', (err, result) => {
    if (err) {
      res.status(500).send('Error fetching post count');
    } else {
      res.status(200).json(result[0]);
    }
  });
};

// 處理獲取單個用戶帖子總數請求
exports.getUserPostCount = (req, res) => {
  const { uid } = req.body;
  connection.query('SELECT COUNT(*) AS userPostCount FROM posts WHERE uid = ? AND deleted_at IS NULL', [uid], (err, result) => {
    if (err) {
      res.status(500).send('Error fetching post count');
    } else {
      res.status(200).json(result[0]);
    }
  });
};

// 處理獲取用戶總數變化請求
exports.getUsersCompareCount = (req, res) => {
  // 查詢今天新增的用戶數
  connection.query('SELECT COUNT(*) AS newUserCount FROM users WHERE DATE(created_at) = CURDATE()', (error, results) => {
    if (error) throw error;
    const newUserCount = results[0].newUserCount;

    // 查詢今天註銷的用戶數
    connection.query('SELECT COUNT(*) AS deletedUserCount FROM users WHERE DATE(deleted_at) = CURDATE()', (error, results) => {
      if (error) throw error;
      const deletedUserCount = results[0].deletedUserCount;
      compareUserCount = newUserCount - deletedUserCount;

      // 返回 JSON 數據給前端
      res.json({ compareUserCount });
    })
  })
};

// 處理獲取帖子總數變化請求
exports.getPostsCompareCount = (req, res) => {
  // 查詢今天新增的帖子數
  connection.query('SELECT COUNT(*) AS newPostCount FROM posts WHERE DATE(created_at) = CURDATE()', (error, results) => {
    if (error) throw error;
    const newPostCount = results[0].newPostCount;

    // 今天刪除的帖子數
    connection.query('SELECT COUNT(*) AS deletedPostCount FROM posts WHERE DATE(deleted_at) = CURDATE()', (error, results) => {
      if (error) throw error;
      const deletedPostCount = results[0].deletedPostCount;
      comparePostCount = newPostCount - deletedPostCount;
       // 返回 JSON 數據給前端
      res.json({ comparePostCount });
    });
  })
};