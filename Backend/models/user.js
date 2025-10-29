const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png' } // URL ảnh mặc định
});

module.exports = mongoose.model('user', UserSchema);