const express = require('express');
const router = express.Router();
const { getAllUsers, updateAvatar } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Cấu hình Multer để lưu file vào thư mục uploads nằm cùng cấp với server.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const username = req.user.username;
    const ext = path.extname(file.originalname);
    cb(null, `${username}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

router.get('/', authMiddleware, getAllUsers);
router.put('/avatar', authMiddleware, upload.single('avatar'), updateAvatar);

module.exports = router;