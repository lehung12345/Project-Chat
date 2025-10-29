const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config();

const connectMongoDB = require('./config/db');
const { connectMySQL } = require('./config/mysql');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Khởi động cả hai database
connectMongoDB();
connectMySQL();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log("Tạo thư mục uploads...");
  fs.mkdirSync(uploadsDir);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use('/uploads', express.static(uploadsDir));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// ⭐ Sửa đổi Socket.IO để xử lý tin nhắn chính xác
const Message = require('./models/message');
const usersMap = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (username) => {
    usersMap.set(username, socket.id);
    console.log(`User ${username} joined with socket ID ${socket.id}`);
  });

  socket.on('sendMessage', async (message) => {
    console.log('Received message:', message);
    
    try {
      const newMessage = new Message({
        sender: message.sender,
        receiver: message.to,
        content: message.content
      });
      await newMessage.save();

      // Gửi tin nhắn đến người nhận cụ thể
      const receiverSocketId = usersMap.get(message.to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message', newMessage);
      }
      
      // Gửi lại tin nhắn cho chính người gửi để hiển thị trên màn hình của họ
      io.to(socket.id).emit('message', newMessage);

    } catch (err) {
      console.error('Lỗi khi lưu tin nhắn:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [key, value] of usersMap.entries()) {
      if (value === socket.id) {
        usersMap.delete(key);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));