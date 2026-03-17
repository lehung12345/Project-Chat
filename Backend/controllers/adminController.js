const { pool } = require('../config/mysql');
const Message = require('../models/message');

/**
 * Lấy tất cả users (Admin)
 */
// exports.getAllUsersAdmin = async (req, res) => {
//   try {

//     const [rows] = await pool.execute(`
//       SELECT 
//         username,
//         email,
//         role,
//         avatarUrl,
//         phone,
//         address,
//         created_at,
//         last_active
//       FROM users
//       ORDER BY created_at DESC
//     `);

//     res.json(rows);

//   } catch (err) {
//     console.error("Admin get users error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };



exports.getAllUsersAdmin = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        username, email, role, avatarUrl, phone, address, created_at, last_active
      FROM users
      WHERE role = 'user' 
      ORDER BY created_at DESC
    `); 

    res.json(rows);
  } catch (err) {
    console.error("Admin get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Thống kê hệ thống (Chỉ đếm User, không đếm Admin)
 */
exports.getStats = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'user'`
    );

    const totalMessages = await Message.countDocuments();
    const today = new Date();
    today.setHours(0,0,0,0);
    const messagesToday = await Message.countDocuments({
      timestamp: { $gte: today }
    });

    res.json({
      totalUsers: users[0].totalUsers,
      totalMessages,
      messagesToday
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// /**
//  * Xóa user
//  */
// exports.deleteUser = async (req, res) => {
//   try {

//     const { username } = req.params;

//     // Không cho admin tự xóa mình
//     if (username === req.user.username) {
//       return res.status(400).json({
//         message: "Admin không thể tự xóa chính mình"
//       });
//     }

//     await pool.execute(
//       `DELETE FROM users WHERE username = ?`,
//       [username]
//     );

//     res.json({
//       message: "Xóa user thành công"
//     });

//   } catch (err) {
//     console.error("Delete user error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

/**
 * Xóa user và toàn bộ tin nhắn liên quan
 */
exports.deleteUser = async (req, res) => {
  try {
    const { username } = req.params;

    // 1. Không cho admin tự xóa chính mình
    if (username === req.user.username) {
      return res.status(400).json({
        message: "Admin không thể tự xóa chính mình"
      });
    }

    // 2. Xóa toàn bộ tin nhắn liên quan trong MongoDB (Cả chiều gửi và nhận)
    // Chúng ta xóa tất cả tin nhắn mà user này là người gửi HOẶC người nhận
    const deleteMessagesResult = await Message.deleteMany({
      $or: [
        { sender: username },
        { receiver: username }
      ]
    });
    console.log(`Đã xóa ${deleteMessagesResult.deletedCount} tin nhắn của user: ${username}`);

    // 3. Xóa user trong MySQL
    const [result] = await pool.execute(
      `DELETE FROM users WHERE username = ?`,
      [username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng để xóa" });
    }

    res.json({
      message: "Xóa user và dữ liệu tin nhắn thành công",
      deletedMessagesCount: deleteMessagesResult.deletedCount
    });

  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// /**
//  * Thống kê hệ thống
//  */
// exports.getStats = async (req, res) => {
//   try {

//     // total users
//     const [users] = await pool.execute(
//       `SELECT COUNT(*) AS totalUsers FROM users`
//     );

//     // total messages
//     const totalMessages = await Message.countDocuments();

//     // messages today
//     const today = new Date();
//     today.setHours(0,0,0,0);

//     const messagesToday = await Message.countDocuments({
//       timestamp: { $gte: today }
//     });

//     res.json({
//       totalUsers: users[0].totalUsers,
//       totalMessages,
//       messagesToday
//     });

//   } catch (err) {
//     console.error("Stats error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


/**
 * Xem toàn bộ tin nhắn hệ thống
 */
exports.getAllMessagesAdmin = async (req, res) => {
  try {

    const messages = await Message
      .find({})
      .sort({ timestamp: -1 })
      .limit(200)
      .lean();

    res.json(messages);

  } catch (err) {
    console.error("Admin messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};