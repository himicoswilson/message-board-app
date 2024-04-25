const mysql = require('mysql');
const connection = require('../database/connection');

// 處理獲取用戶信息請求
exports.getUserInfo = (req, res) => {
  // 實現獲取用戶信息邏輯
  const { token } = req.body;

  // 查詢數據庫以獲取用戶信息
  const query = `SELECT id, username, avatar_url FROM users WHERE token = '${token}'`;

  connection.query(query, (error, results, fields) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // 獲取用戶信息
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
};

// 處理查詢是否註銷請求
exports.searchLogoff = (req, res) => {
  const { username, password } = req.body;

  // 使用帳號密碼進行登陸，並且檢查該帳戶是否已經註銷
  connection.query('SELECT * FROM users WHERE username = ? AND password = ? AND deleted_at IS NOT NULL', [username, password], (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      // 根據 results 來判斷是否註銷
      if (results.length > 0) {
        // 查询到已注销用户记录，返回账户已注销信息
        res.status(200).send(results[0]);
      } else {
        // 未查询到已注销用户记录，返回登录成功信息
        res.status(401).send('Internal username or password')
      }
    }
  });
};

// 處理恢復用戶請求
exports.restoreUser = (req, res) => {
  const { username, password } = req.body;

  // 使用username和password查詢數據，並把deleted_at改為null
  connection.query('UPDATE users SET deleted_at = NULL WHERE username = ? AND password = ?', [username, password], (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      // 根據 results 來判斷是否恢復
      if (results.affectedRows > 0) {
        // 恢復成功，返回恢復成功信息
        res.status(200).send('Restore user successfully');
      } else {
        // 恢復失敗，返回恢復失敗信息
        res.status(401).send('Restore user failed');
      }
    }
  });
};

exports.userLikes = (req, res) => {
  const { uid } = req.body;
  connection.query('SELECT * FROM likes WHERE uid = ?', [uid], (err, result) => {
    if (err) {
      res.status(500).send('Error fetching likes');
    } else {
      res.status(200).json(result);
    }
  });
}