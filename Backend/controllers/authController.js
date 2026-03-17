const { pool } = require('../config/mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ĐĂNG KÝ (Bổ sung email và mặc định role là user)
exports.register = async (req, res) => {
    const { username, email, password } = req.body; // Thêm email vào request body
    if (username !== username.trim()) {
        return res.status(400).json({
            message: "Tên đăng nhập không được có khoảng trắng ở đầu hoặc cuối"
        });
    }
    
    try {
        // 1. Kiểm tra username hoặc email đã tồn tại hay chưa
        const [existingUser] = await pool.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?', 
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ 
                message: 'Tên đăng nhập hoặc Email đã được sử dụng.' 
            });
        }
        
        // 2. Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Lưu người dùng vào MySQL (Mặc định role là 'user')
        await pool.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
            [username, email, hashedPassword, 'user']
        );

        res.json({ message: 'Đăng ký tài khoản thành công!' });
    } catch (err) {
        console.error("Lỗi đăng ký:", err);
        res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
    }
};

// ĐĂNG NHẬP (Bổ sung role vào Token)
exports.login = async (req, res) => {
    const { username, password } = req.body;
    if(username !== username.trim()){
        return res.status(400).json({
            message:"Tên đăng nhập không được có khoảng trắng ở đầu hoặc cuối"
        });
    }

    try {
        // 1. Tìm người dùng dựa trên username
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
        }
        
        const user = rows[0];
        
        // 2. So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu.' });
        }
        
        // 3. Tạo JWT Token chứa cả username và role (phân quyền)
        // Thông tin role này sẽ giúp middleware hoặc frontend xác định quyền admin
        const token = jwt.sign(
            { 
                username: user.username, 
                role: user.role // Thêm role vào token
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // 4. Trả về thông tin cần thiết
        res.json({ 
            token, 
            username: user.username, 
            role: user.role // Trả về role để frontend lưu trữ và điều hướng trang
        });

    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
};