const mysql = require('mysql');
const connection = require('../database/connection');

// 處理發帖請求
exports.createPost = (req, res) => {
  const { title, content, uid } = req.body;

  connection.query('INSERT INTO posts (title, content, uid) VALUES (?, ?, ?)', [title, content, uid], (err, result) => {
    if (err) {
      res.status(500).send('Post failed');
    } else {
      const pid = result.insertId;
      connection.query('INSERT INTO history_posts (title, content, pid, uid, action) VALUES (?, ?, ?, ?, "created")', [title, content, pid, uid], (err, result) => {
        if (err) {
          res.status(500).send('Post failed');
        } else {
          res.status(200).send('Post successful');
        }
      });
    }
  });
};

// 處理獲取單個帖子請求
exports.getPost = (req, res) => {
  const pid = req.params.id;
  // 通過id獲取帖子信息
  connection.query('SELECT posts.*, users.avatar_url, users.username FROM posts JOIN users ON posts.uid = users.id WHERE posts.id = ?', [pid], (err, result) => {
    if (err) {
      res.status(500).send('Error fetching post');
    } else {
      if (result.length > 0) {
        res.status(200).json(result[0]); // 返回單個帖子
      } else {
        res.status(404).send('Post not found');
      }
    }
  })
};

// 處理獲取最新帖子請求
exports.getNewestPost = (req, res) => {
  // 查詢最新一篇帖子的信息以及對應的用戶名
  connection.query('SELECT posts.id, posts.title, posts.content, posts.created_at, users.username, users.avatar_url FROM posts JOIN users ON posts.uid = users.id ORDER BY posts.created_at DESC LIMIT 1', (err, result) => {
    if (err) {
      res.status(500).send('Error fetching latest post');
    } else {
      if (result.length > 0) {
        res.status(200).json(result[0]); // 返回單個最新的帖子
      } else {
        res.status(404).send('No posts found');
      }
    }
  });
};

// 處理獲取所有帖子請求
exports.getPagePosts = (req, res) => {
  const itemsPerPage = 11; // 每頁顯示的數據條目數
  let currentPage = req.params.page || 1; // 從路由參數中獲取當前頁碼，默認為第1頁

  // 計算需要跳過的數據條目數量
  const offset = (currentPage - 1) * itemsPerPage;

  // 查詢帖子信息和對應的用戶名，按照帖子創建時間倒序排列，並限制返回的數據條目數
  connection.query('SELECT posts.*, users.username, users.avatar_url FROM posts JOIN users ON posts.uid = users.id WHERE posts.deleted_at IS NULL ORDER BY posts.created_at DESC LIMIT ?, ?', [offset, itemsPerPage], (err, result) => {
    if (err) {
      res.status(500).send('Error fetching posts');
    } else {
      if (result.length > 0) {
        res.status(200).json(result);
      } else {
        res.status(404).send('No posts found');
      }
    }
  });
};

// 處理編輯帖子請求
exports.editPost = (req, res) => {
  const pid = req.params.id;
  const { title, content, uid, user_token } = req.body;

  // 通過pid去posts表裡找到對應的uid，然後通過uid去users裡拿token，校驗user_token和token是否相等
  connection.query('SELECT u.token\
    FROM posts p\
    JOIN users u ON p.uid = u.id\
    WHERE p.id = ?;', [pid], (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching post');
    } else {
      if (rows.length > 0) {
        const token = rows[0].token;
        if (token === user_token) {
          // 驗證通過，更新帖子信息
          connection.query('INSERT INTO history_posts (title, content, pid, uid, action) VALUES (?, ?, ?, ?, "edited")', [title, content, pid, uid], (err, result) => {
            if (err) {
              res.status(500).send('Error updating post');
            } else {
              connection.query('UPDATE posts SET title = ?, content = ?, updated_at = NOW() WHERE id = ?', [title, content, pid], (err, result) => {
                if (err) {
                  res.status(500).send('Error updating post');
                } else {
                  res.status(200).send('Post updated successfully');
                }
              });
            }
          });
        } else {
          res.status(403).send('Unauthorized: User token does not match post owner');
        }
      }
    }
  })
};

exports.getEditPost = (req, res) => {
  const pid = req.params.id;
  // 通過id獲取帖子信息
  connection.query('SELECT posts.*, users.avatar_url, users.username FROM posts JOIN users ON posts.uid = users.id WHERE posts.id = ?', [pid], (err, result) => {
    if (err) {
      res.status(500).send('Error fetching post');
    } else {
      if (result.length > 0) {
        res.status(200).json(result[0]); // 返回單個帖子及用戶信息
      } else {
        res.status(404).send('No posts found');
      }
    }
  });
}

exports.getHistoryPost = (req, res) => {
  const pid = req.params.id;

  // 查詢帖子信息和對應的用戶名，按照帖子創建時間倒序排列
  connection.query( 'SELECT history_posts.*, users.username, users.avatar_url FROM history_posts JOIN users ON history_posts.uid = users.id WHERE history_posts.pid = ? ORDER BY history_posts.created_at DESC', [pid], (err, result) => {
    if (err) {
      res.status(500).send('Error fetching history posts');
    } else {
      if (result.length > 0) {
        res.status(200).json(result);
      } else {
        res.status(404).send('No history posts found');
      }
    }
  })
};

// 處理點讚帖子請求
exports.likePost = (req, res) => {
  const { uid, pid } = req.body;
  connection.query('SELECT * FROM likes WHERE pid = ? AND uid = ?', [pid, uid], (err, result) => {
    if (err) {
      res.status(500).send('Error fetching likes');
    } else {
      
      if (result.length > 0) {
        // 如果已經點贊過，則取消點贊
        connection.query( 'DELETE FROM likes WHERE pid = ? AND uid = ?', [pid, uid], (err, result) => {
          if (err) {
            res.status(500).send('Error unliking post');
          } else {
            res.status(200).send('Post unliked successfully');
          }
        })
      } else {
        connection.query('INSERT INTO likes (pid, uid) VALUES (?, ?)', [pid, uid], (err, result) => {
          if (err) {
            res.status(500).send('Error liking post');
          } else {
            res.status(200).send('Post liked successfully');
          }
        });
      }
    }
  })
}

exports.updateLikeNum = (req, res) => {
  const { pid } = req.body;
  connection.query('UPDATE posts p\
    LEFT JOIN (\
      SELECT pid, COUNT(*) AS like_count\
      FROM likes\
      WHERE pid = ?\
      GROUP BY pid\
    ) l ON p.id = l.pid\
    SET p.like_num = IFNULL(l.like_count, 0)\
    WHERE p.id = ?', [pid, pid], (err, updateResult) => {
      if (err) {
        res.status(500).send('Error updating likes');
      } else {
        res.status(200).send('Likes updated successfully');
      }
  });
}

// 處理刪除帖子請求
exports.deletePost = (req, res) => {
  const pid = req.params.id;
  const { user_token } = req.body;
  
  // 通過pid去posts表裡找到對應的uid，然後通過uid去users裡拿token，校驗user_token和token是否相等
  connection.query('SELECT u.token\
    FROM posts p\
    JOIN users u ON p.uid = u.id\
    WHERE p.id = ?;', [pid], (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching post');
    } else {
      if (rows.length > 0) {
        const token = rows[0].token;
        if (token === user_token) {
          // 給指定帖子添加 deleted_at 字段
          connection.query('UPDATE posts SET deleted_at = NOW() WHERE id = ?', [pid], (err, result) => {
            if (err) {
              res.status(500).send('Error deleting post');
            } else {
              if (result.affectedRows > 0) {
                res.status(200).send('Post deleted successfully');
              } else {
                res.status(404).send('Post not found');
              }
            }
          });
        } else {
          res.status(403).send('Unauthorized: User token does not match post owner');
        }
      }
    }
  })
};
