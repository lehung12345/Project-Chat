const jwt = require('jsonwebtoken');
const { pool } = require('../config/mysql');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute('SELECT username, avatarUrl FROM users WHERE username = ?', [decoded.username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Access Denied: User not found.' });
    }

    req.user = rows[0]; // Gán thông tin người dùng từ MySQL vào request
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(400).json({ message: 'Invalid Token.' });
  }
};

module.exports = authMiddleware;
