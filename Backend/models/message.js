// const mongoose = require('mongoose');
// const messageSchema = new mongoose.Schema({
//   sender:    { type: String, required: true },
//   receiver:  { type: String, required: true },
//   content:   { type: String, default: '' },
//   fileUrl:   { type: String, default: null },
//   fileType:  { type: String, default: null },
//   isDeleted: { type: Boolean, default: false }, // 👈 THÊM DÒNG NÀY
//   voiceUrl: String, // <--- Thêm trường này
//   type: String,     // <--- Thêm trường này (text/file/voice)
//   status: {
//     type: String,
//     enum: ['sent', 'seen'],   // chỉ dùng 2 giá trị này
//     default: 'sent'
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now
//   }
//   // Nếu sau này muốn thêm thời gian seen chính xác thì mới thêm seenAt
//   // seenAt: { type: Date, default: null }
// });

// module.exports = mongoose.model('Message', messageSchema);





const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:    { type: String, required: true },
  receiver:  { type: String, required: true },
  content:   { type: String, default: '' },
  fileUrl:   { type: String, default: null },
  fileType:  { type: String, default: null },
  isDeleted: { type: Boolean, default: false },
  voiceUrl:  { type: String, default: null },
  
  // Phân loại tin nhắn: 'text', 'file', 'voice', hoặc 'call'
  type: { 
    type: String, 
    enum: ['text', 'file', 'voice', 'call'], 
    default: 'text' 
  },

  // Dành riêng cho tính năng gọi điện
  callStatus: { 
    type: String, 
    enum: ['missed', 'completed', 'declined', 'cancelled', null], 
    default: null 
  },
  duration: { type: Number, default: 0 }, // Tính bằng giây

  status: {
    type: String,
    enum: ['sent', 'seen'],
    default: 'sent'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);