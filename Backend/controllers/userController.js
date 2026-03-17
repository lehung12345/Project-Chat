const { pool } = require('../config/mysql');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Chỉ lấy phần code getAllUsers, các phần khác giữ nguyên như file bạn gửi
exports.getAllUsers = async (req, res) => {
    try {
        // SQL: Chỉ lấy những người có role là 'user'
        const query = 'SELECT username, avatarUrl FROM users WHERE role = "user"';
        const [rows] = await pool.execute(query);
        
        const usersWithUrls = rows.map(user => ({
            username: user.username,
            avatarUrl: user.avatarUrl
                ? `${BASE_URL}/uploads/${path.basename(user.avatarUrl)}`
                : `${BASE_URL}/uploads/default_avatar.png`
        }));
        
        res.json(usersWithUrls);
    } catch (err) {
        console.error("Lỗi lấy danh sách user:", err);
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

exports.getUserStatus = async (req, res) => {
  const { username } = req.params;

  const [rows] = await pool.execute(
    'SELECT last_active FROM users WHERE username = ?',
    [username]
  );

  if (!rows.length) return res.status(404).json({ message: 'Not found' });

  res.json(rows[0]);
};

//profile
exports.getProfile = async (req, res) => {
    try {
        const { username } = req.user;

        const [rows] = await pool.execute(
            `SELECT username,email,role,avatarUrl,address,phone,created_at 
             FROM users 
             WHERE username = ?`,
            [username]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error("Lỗi lấy profile:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const { username } = req.user;
        let { address, phone } = req.body;

        // trim dữ liệu
        address = address ? address.trim() : null;
        phone = phone ? phone.trim() : null;

        // validate phone nếu có nhập
        if (phone) {

            // chỉ cho phép số
            if (!/^\d+$/.test(phone)) {
                return res.status(400).json({
                    message: "Số điện thoại chỉ được chứa số"
                });
            }

            // phải bắt đầu bằng 0 và 10 số
            if (!/^0\d{9}$/.test(phone)) {
                return res.status(400).json({
                    message: "Số điện thoại phải có 10 số và bắt đầu bằng 0"
                });
            }

            // kiểm tra phone đã tồn tại chưa
            const [exist] = await pool.execute(
                `SELECT username FROM users WHERE phone = ? AND username != ?`,
                [phone, username]
            );

            if (exist.length > 0) {
                return res.status(400).json({
                    message: "Số điện thoại đã được sử dụng"
                });
            }
        }

        // update profile
        await pool.execute(
            `UPDATE users 
             SET address = ?, phone = ?
             WHERE username = ?`,
            [address, phone, username]
        );

        res.json({
            message: "Cập nhật profile thành công",
            data: {
                address,
                phone
            }
        });

    } catch (err) {
        console.error("Lỗi update profile:", err);
        res.status(500).json({
            message: "Lỗi server khi cập nhật profile"
        });
    }
};

const bcrypt = require('bcryptjs');

exports.changePassword = async (req, res) => {
    try {
        const { username } = req.user;
        const { oldPassword, newPassword } = req.body;

        const [rows] = await pool.execute(
            'SELECT password FROM users WHERE username = ?',
            [username]
        );

        if (!rows.length) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.execute(
            'UPDATE users SET password = ? WHERE username = ?',
            [hashedPassword, username]
        );

        res.json({ message: "Đổi mật khẩu thành công" });

    } catch (err) {
        console.error("Lỗi đổi password:", err);
        res.status(500).json({ message: "Server error" });
    }
};