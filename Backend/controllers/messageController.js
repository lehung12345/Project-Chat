const Message = require('../models/message');

exports.getMessages = async (req, res) => {
    const currentUser = req.user.username;
    const { to } = req.query;

    try {
        const messages = await Message.find({
            $or: [
                { sender: currentUser, receiver: to },
                { sender: to, receiver: currentUser }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        console.error("Get messages error:", err);
        res.status(500).json({ message: 'Lỗi khi lấy tin nhắn' });
    }
};