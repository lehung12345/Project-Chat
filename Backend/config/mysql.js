const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectMySQL = async () => {
    try {
        await pool.getConnection();
        console.log("MySQL connected to chatdb");
        // Kiểm tra và tạo bảng users nếu chưa tồn tại
        const [rows] = await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                avatarUrl VARCHAR(255) DEFAULT '/uploads/default_avatar.png'
            );
        `);
        console.log("MySQL 'users' table is ready.");
    } catch (err) {
        console.error("MySQL connection error:", err.message);
        process.exit(1);
    }
};

module.exports = { pool, connectMySQL };