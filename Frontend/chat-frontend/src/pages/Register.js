import React, { useState } from 'react';
import axios from 'axios';
import '../style/register.css';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', { username, password });
      alert('Đăng ký thành công! Đăng nhập ngay.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra.';
      setError('Đăng ký thất bại: ' + msg);
    }
  };

  return (
    <div className="register-container">
      <h2>Đăng ký</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p style={{ color: 'red', fontSize: '14px', marginTop: '-10px', marginBottom: '10px', textAlign: 'left' }}>
          {error}
        </p>
        <button type="submit">Đăng ký</button>
      </form>
      <p>Đã có tài khoản? <Link to="/">Đăng nhập</Link></p>
    </div>
  );
}

export default Register;
