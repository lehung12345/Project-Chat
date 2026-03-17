import React, { useState } from "react";
import api from "../api";
import "../style/register.css";
import { useNavigate, Link } from "react-router-dom";

function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    // Không cho khoảng trắng đầu cuối
    if (username !== username.trim()) {
      setError("Tên đăng nhập không được có khoảng trắng ở đầu hoặc cuối.");
      return;
    }

    try {
      await api.post("/auth/register", { username, email, password });

      alert("Đăng ký thành công! Đăng nhập ngay.");
      navigate("/");

    } catch (err) {

      const msg = err.response?.data?.message || "Có lỗi xảy ra.";
      setError("Đăng ký thất bại: " + msg);

    }
  };

  return (
    <div className="auth-container">

      <div className="bg-decoration">
        <div className="circle c1"></div>
        <div className="circle c2"></div>
      </div>

      <div className="auth-card">

        <div className="header">
          <h2>Tạo tài khoản</h2>
          <p>Bắt đầu kết nối với mọi người ngay</p>
        </div>

        <form onSubmit={handleRegister}>

          <div className="input-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-primary">
            Đăng ký
          </button>

        </form>

        <div className="switch-auth">
          Đã có tài khoản? <Link to="/">Đăng nhập</Link>
        </div>

      </div>
    </div>
  );
}

export default Register;