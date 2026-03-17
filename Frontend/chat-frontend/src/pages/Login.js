// import React, { useState } from "react";
// import api from "../api";
// import "../style/login.css";
// import { useNavigate, Link } from "react-router-dom";

// function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!username || !password) {
//       setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
//       return;
//     }

//     try {
//       const res = await api.post("/auth/login", { username, password });

//       // Lưu thông tin vào Storage
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("username", res.data.username);
//       localStorage.setItem("role", res.data.role);

//       // --- LOGIC ĐIỀU HƯỚNG MỚI ---
//       if (res.data.role === "admin") {
//         // Nếu là admin, đẩy thẳng vào trang admin dashboard
//         navigate("/admin");
//       } else {
//         // Nếu là user thường, vào trang chat
//         navigate("/chat");
//       }
      
//     } catch (err) {
//       const msg = err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
//       setError("Đăng nhập thất bại: " + msg);
//     }
//   };

//   return (
//     <div className="auth-container">

//       <div className="bg-decoration">
//         <div className="circle c1"></div>
//         <div className="circle c2"></div>
//       </div>

//       <div className="auth-card">

//         <div className="header">
//           <h2>Đăng nhập</h2>
//           <p>Mừng bạn quay trở lại với chúng tôi!</p>
//         </div>

//         <form onSubmit={handleLogin}>

//           <div className="input-group">
//             <label>Tên đăng nhập</label>
//             <input
//               type="text"
//               placeholder="Nhập tên đăng nhập"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//             />
//           </div>

//           <div className="input-group">
//             <label>Mật khẩu</label>
//             <input
//               type="password"
//               placeholder="Nhập mật khẩu"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           {error && <p className="error">{error}</p>}

//           <button type="submit" className="btn-primary">
//             Đăng nhập
//           </button>

//         </form>

//         <div className="switch-auth">
//           Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default Login;



import React, { useState } from "react";
import api from "../api";
import "../style/login.css";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset lỗi cũ mỗi lần nhấn login

    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    try {
      const res = await api.post("/auth/login", { username, password });

      // KIỂM TRA QUYỀN: Nếu là admin thì không cho phép vào cổng này
      if (res.data.role === "admin") {
        setError("Tài khoản sai.");
        return; 
      }

      // Nếu là user thường thì mới lưu thông tin và cho vào chat
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);

      navigate("/chat");
      
    } catch (err) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      setError("Đăng nhập thất bại: " + msg);
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
          <h2>Đăng nhập</h2>
          <p>Mừng bạn quay trở lại với chúng tôi!</p>
        </div>

        <form onSubmit={handleLogin}>
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
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-primary">
            Đăng nhập
          </button>
        </form>

        <div className="switch-auth">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;