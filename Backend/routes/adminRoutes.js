const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

const {
  getAllUsersAdmin,
  deleteUser,
  getStats,
  getAllMessagesAdmin
} = require('../controllers/adminController');


/**
 * Lấy danh sách user
 */
router.get(
  '/users',
  authMiddleware,
  isAdmin,
  getAllUsersAdmin
);


/**
 * Xóa user
 */
router.delete(
  '/users/:username',
  authMiddleware,
  isAdmin,
  deleteUser
);


/**
 * Thống kê hệ thống
 */
router.get(
  '/stats',
  authMiddleware,
  isAdmin,
  getStats
);


/**
 * Xem toàn bộ tin nhắn
 */
router.get(
  '/messages',
  authMiddleware,
  isAdmin,
  getAllMessagesAdmin
);


module.exports = router;