const Message = require('../models/message');

exports.getMessages = async (req, res) => {
  const currentUser = req.user.username;
  const { to } = req.query;

  if (!to) {
    return res.status(400).json({ message: 'Thiếu tham số to' });
  }

  try {
    // 1. Đánh dấu đã xem tất cả tin nhắn mà người kia gửi cho mình (khi mở chat)
    await Message.updateMany(
      {
        sender: to,
        receiver: currentUser,
        status: 'sent'          // chỉ update những tin còn "sent"
      },
      { $set: { status: 'seen' } }
    );

    // 2. Lấy lịch sử chat 2 chiều
    const messages = await Message.find({
      $or: [
        { sender: currentUser, receiver: to },
        { sender: to, receiver: currentUser }
      ]
    })
      .sort({ timestamp: 1 })
      .lean();  // nhẹ hơn, không cần mongoose document methods

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: 'Lỗi khi lấy tin nhắn' });
  }
};