const jwt = require('jsonwebtoken');
const { pool } = require('../config/mysql');

const authMiddleware = async (req, res, next) => {
  // Lấy token từ header Authorization
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Quyền truy cập bị từ chối: Không có mã xác thực.' });
  }

  try {
    // 1. Giải mã token để lấy username
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 2. Truy vấn lấy thông tin user từ MySQL (Lấy thêm role và email)
    const [rows] = await pool.execute(
      'SELECT username, email, role, avatarUrl FROM users WHERE username = ?', 
      [decoded.username]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Quyền truy cập bị từ chối: Người dùng không tồn tại.' });
    }

    // 3. Gán thông tin người dùng vào req.user
    // Bây giờ req.user sẽ có: { username, email, role, avatarUrl }
    req.user = rows[0]; 
    
    next();
  } catch (err) {
    console.error("Lỗi xác thực Token:", err.message);
    return res.status(401).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' });
  }
};

module.exports = authMiddleware;