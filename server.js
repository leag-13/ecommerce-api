// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');

dotenv.config(); // Load biến môi trường từ .env
connectDB();     // Kết nối MongoDB

const app = express();
app.use(helmet());        // Bảo mật headers
app.use(cors());          // Cho phép CORS
app.use(express.json());  // Đọc JSON từ request
app.use(morgan('dev'));   // Logging truy cập

// Route mặc định (test)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to E-Commerce API' });
});

// Các route khác sẽ thêm bên dưới
// ...

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
