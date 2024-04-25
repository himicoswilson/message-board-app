const mysql = require('mysql');
const connection = require('../database/connection');

// 處理登錄請求
exports.login = (req, res) => {
  const { username, password } = req.body;

  // 使用帳號密碼進行登陸，並且檢查該帳戶是否已經註銷
  connection.query('SELECT * FROM users WHERE username = ? AND password = ? AND deleted_at IS NULL', [username, password], (error, results) => {
    if (error) {
      res.status(500).send(error);
    } else {
      if (results.length === 0) {
        // 账号不存在或密码错误
        res.status(401).send('The account does not exist or the password is incorrect');
      } else if (results.length > 0) {
        const token = results[0].token;
        res.json({ token: token }); // 返回有效的 token
      }
    }
  });
};

// 處理註冊請求
exports.signup = (req, res) => {
  const { username, password, token } = req.body;

  // 檢查用户名是否已經存在
  connection.query('SELECT * FROM users WHERE username = ?', [username], (usernameCheckError, usernameCheckResult) => {
    if (usernameCheckError) {
      res.status(500).send('Server error while checking username');
    } else {
      if (usernameCheckResult.length > 0) {
        // 存在相同的用户名，注册失败
        res.status(409).send('Username already exists');
      } else {
        // 名字未被使用，继续执行注册操作
        connection.query('INSERT INTO users (username, password, token) VALUES (?, ?, ?)', [username, password, token], (err, result) => {
          if (err) {
            res.status(500).send('Signup failed');
          } else {
            res.status(200).send('Signup successful');
          }
        });
      }
    }
  });
};

// 處理註銷請求
exports.logoff = (req, res) => {
  const { token } = req.body;

  // 用 token 找到用戶然後在 deleted_at 欄目設置當前時間
  connection.query('UPDATE users SET deleted_at = NOW() WHERE token = ?', [token], (err, result) => {
    if (err) {
      res.status(500).send('Logoff failed');
    } else {
      res.status(200).send('Logoff successful');
    }
  });

  // 註銷完把該用戶的 post 全都給 deleted_at 欄目設置當前時間
  connection.query('UPDATE posts SET deleted_at = NOW() WHERE user_token = ?', [token])
};
