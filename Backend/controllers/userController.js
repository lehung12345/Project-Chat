const { pool } = require('../config/mysql');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT username, avatarUrl FROM users');
        const usersWithUrls = rows.map(user => ({
            username: user.username,
            avatarUrl: user.avatarUrl
                ? `${BASE_URL}/uploads/${path.basename(user.avatarUrl)}`
                : `${BASE_URL}/uploads/default_avatar.png`
        }));
        res.json(usersWithUrls);
    } catch (err) {
        console.error("Lỗi lấy danh sách người dùng:", err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng' });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        const { username } = req.user;
        if (!req.file) {
            return res.status(400).json({ message: 'Không tìm thấy file ảnh.' });
        }
        
        const avatarFilename = req.file.filename;

        await pool.execute('UPDATE users SET avatarUrl = ? WHERE username = ?', [avatarFilename, username]);
        
        const avatarUrl = `${BASE_URL}/uploads/${avatarFilename}?t=${Date.now()}`;

        res.json({ message: 'Cập nhật avatar thành công!', avatarUrl });
    } catch (err) {
        console.error("Lỗi cập nhật avatar:", err);
        res.status(500).json({ message: 'Lỗi server khi cập nhật avatar' });
    }
};
