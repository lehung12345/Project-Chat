// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const { getMessages } = require('../controllers/messageController');

// router.get('/', authMiddleware, getMessages);

// module.exports = router;




const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getMessages } = require('../controllers/messageController');
const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ cho Voice Messages
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/voices/'));
  },
  filename: (req, file, cb) => {
    const username = req.user.username;
    cb(null, `voice-${username}-${Date.now()}.webm`);
  },
});
const upload = multer({ storage });

// Route lấy tin nhắn cũ
router.get('/', authMiddleware, getMessages);

// Route mới: Upload file ghi âm
router.post('/upload-voice', authMiddleware, upload.single('voice'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file âm thanh' });
  }
  const voiceUrl = `/uploads/voices/${req.file.filename}`;
  res.json({ voiceUrl });
});

module.exports = router;