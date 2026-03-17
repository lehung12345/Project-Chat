require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3307,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'chatdb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectMySQL = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("MySQL connected to chatdb");

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user', -- Thêm dòng này
                address VARCHAR(255) DEFAULT NULL,
                phone VARCHAR(20) DEFAULT NULL,
                avatarUrl VARCHAR(255) DEFAULT 'default_avatar.png',
                last_active DATETIME DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Users table is ready.");
        connection.release();

    } catch (err) {
        console.error("MySQL connection error:", err.message);
        process.exit(1);
    }
};

module.exports = { pool, connectMySQL };