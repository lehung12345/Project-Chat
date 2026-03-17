const express = require('express');
const router = express.Router();
const { getAllUsers, updateAvatar, getUserStatus, getProfile, updateProfile, changePassword } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware'); // Import middleware phân quyền
const multer = require('multer');
const path = require('path');

// Cấu hình Multer để lưu file vào thư mục uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    // req.user được tạo ra từ authMiddleware, đảm bảo có username để đặt tên file
    const username = req.user.username;
    const ext = path.extname(file.originalname);
    cb(null, `${username}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

/**
 * ROUTES QUẢN LÝ NGƯỜI DÙNG
 */

// 1. Lấy danh sách tất cả người dùng - CHỈ ADMIN MỚI CÓ QUYỀN
router.get('/', authMiddleware, getAllUsers);

// 2. Cập nhật ảnh đại diện - Bất kỳ ai đã đăng nhập đều làm được
router.put('/avatar', authMiddleware, upload.single('avatar'), updateAvatar);

// 3. Lấy trạng thái online/offline của một user cụ thể
router.get('/status/:username', authMiddleware, getUserStatus);

// 4 Lấy profile user
router.get('/profile', authMiddleware, getProfile);

// 5 Update profile
router.put('/profile', authMiddleware, updateProfile);

// 6 Change password
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;