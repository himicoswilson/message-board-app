const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
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
