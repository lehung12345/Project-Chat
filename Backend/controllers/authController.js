const { pool } = require('../config/mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại.' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.json({ message: 'Đăng ký thành công!' });
    } catch (err) {
        console.error("Lỗi đăng ký:", err);
        res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
        }
        const user = rows[0];
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
        }
        
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, username: user.username });

    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
};