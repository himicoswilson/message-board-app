const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173', // 設定允許的前端來源
    credentials: true // 允許攜帶身份驗證信息，例如 Cookie
}));
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 5 * 60 * 1000, // 5 min
        secure: false
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Require route files and use them in the app
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/counts', require('./routes/countsRoutes'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
