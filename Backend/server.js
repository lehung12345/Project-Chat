const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { pool } = require('./config/mysql');
const Message = require('./models/message');

dotenv.config();

/* ================= DB ================= */
const connectMongoDB = require('./config/db');
const { connectMySQL } = require('./config/mysql');
connectMongoDB();
connectMySQL();

/* ================= APP ================= */
const app = express();
const server = http.createServer(app);

/* ================= SOCKET ================= */
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

/* ================= UPLOAD DIR ================= */
const uploadsDir = path.join(__dirname, 'uploads');
const voicesDir = path.join(__dirname, 'uploads', 'voices'); // Thêm dòng này

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Đảm bảo thư mục voices tồn tại
if (!fs.existsSync(voicesDir)) {
    fs.mkdirSync(voicesDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads/voices', express.static(voicesDir));

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const utf8Name = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, Date.now() + '-' + utf8Name);
  }
});
const upload = multer({ storage });

/* ================= UPLOAD API ================= */
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  res.json({
    fileUrl: `/uploads/${req.file.filename}`,
    fileName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
    fileType: req.file.mimetype
  });
});

/* ================= ROUTES ================= */
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

/* ================= SOCKET LOGIC ================= */
const usersMap = new Map(); // username -> socketId

io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.id);

  /* ===== JOIN ===== */
  socket.on('join', (username) => {
    if (!username) return;
    usersMap.set(username, socket.id);
    io.emit('online-users', Array.from(usersMap.keys()));
    console.log(`👤 ${username} online`);
  });

  /* ===== SEND MESSAGE ===== */
  socket.on('sendMessage', async (data) => {
    try {
      // Nhận thêm voiceUrl và type từ Frontend gửi lên
      const { sender, receiver, content, fileUrl, fileType, voiceUrl, type } = data;
      if (!sender || !receiver) return;

      const newMessage = new Message({
        sender,
        receiver,
        content: content || '',
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        voiceUrl: voiceUrl || null, // Lưu link ghi âm vào DB
        type: type || 'text',       // Để phân biệt là 'voice', 'file' hay 'text'
        status: 'sent',
        timestamp: new Date()
      });

      await newMessage.save();

      const receiverSocketId = usersMap.get(receiver);
      if (receiverSocketId) {
        // Gửi toàn bộ object newMessage (bao gồm cả voiceUrl) cho người nhận
        io.to(receiverSocketId).emit('message', newMessage);
      }

      // Gửi lại cho chính người gửi để cập nhật giao diện
      socket.emit('message', newMessage);
    } catch (err) {
      console.error('❌ sendMessage error:', err);
    }
  });




    /* ===== MARK SEEN ===== */
  socket.on('markSeen', async ({ sender, receiver }) => {
    try {
      console.log(`markSeen: ${receiver} đã xem tin của ${sender}`);

      // update MongoDB
      const updateResult = await Message.updateMany(
        { sender, receiver, status: 'sent' },
        { $set: { status: 'seen' } }   // thêm $set cho rõ ràng
      );

      console.log(`Updated ${updateResult.modifiedCount} messages to seen`);

      // lấy avatar từ MySQL (lưu ý: avatarUrl trong DB là filename, không phải full URL)
      const [rows] = await pool.execute(
        'SELECT avatarUrl FROM users WHERE username = ?',
        [receiver]
      );
      let avatarUrl = null;
      if (rows.length && rows[0].avatarUrl) {
        avatarUrl = `http://localhost:5000/uploads/${rows[0].avatarUrl}`;
      }

      // báo cho sender
      const senderSocketId = usersMap.get(sender);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messagesSeen', {
          by: receiver,
          avatarUrl
        });
        console.log(`Emitted messagesSeen to ${sender} with avatar: ${avatarUrl}`);
      }
    } catch (err) {
      console.error('❌ markSeen error:', err);
    }
  });

  socket.on('deleteMessage', async ({ messageId, receiver }) => {
    try {
      console.log(`Thu hồi tin nhắn: ${messageId}`);

      // 1. Cập nhật trong MongoDB: đánh dấu là đã xóa và làm trống nội dung
      const deletedMessage = await Message.findByIdAndUpdate(
        messageId,
        { 
          isDeleted: true, 
          content: 'Tin nhắn đã được thu hồi',
          fileUrl: null, // Xóa link ảnh nếu có
          fileType: null 
        },
        { new: true } // Trả về object sau khi update
      );

      if (!deletedMessage) return;

      // 2. Báo cho người nhận để họ cập nhật giao diện
      const receiverSocketId = usersMap.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('messageDeleted', { 
          messageId: deletedMessage._id 
        });
      }

      // 3. Báo lại cho chính người gửi (để đồng bộ các tab nếu dùng nhiều thiết bị)
      socket.emit('messageDeleted', { 
        messageId: deletedMessage._id 
      });

    } catch (err) {
      console.error('❌ deleteMessage error:', err);
    }
  });

  /* ===== DISCONNECT ===== */
  socket.on('disconnect', async () => {
    for (let [username, socketId] of usersMap.entries()) {
      if (socketId === socket.id) {
        usersMap.delete(username);

        await pool.execute(
          'UPDATE users SET last_active = NOW() WHERE username = ?',
          [username]
        );

        io.emit('online-users', Array.from(usersMap.keys()));
        console.log(`❌ ${username} offline`);
        break;
      }
    }
  });
});

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);




