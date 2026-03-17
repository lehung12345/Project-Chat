// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../../api';

// const AdminLogin = () => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const navigate = useNavigate();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await api.post('/auth/login', { username, password });
            
//             // Kiểm tra xem có đúng là Admin không mới cho vào
//             if (res.data.role !== 'admin') {
//                 alert("Bạn không có quyền truy cập vào khu vực Admin!");
//                 return;
//             }

//             localStorage.setItem('token', res.data.token);
//             localStorage.setItem('role', res.data.role);
//             localStorage.setItem('username', res.data.username);
            
//             navigate('/admin'); // Đưa vào dashboard
//         } catch (err) {
//             alert(err.response?.data?.message || "Đăng nhập thất bại");
//         }
//     };

//     return (
//         <div className="login-container">
//             <form onSubmit={handleLogin} className="login-form">
//                 <h2>ADMIN LOGIN</h2>
//                 <input type="text" placeholder="Admin Username" onChange={e => setUsername(e.target.value)} required />
//                 <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
//                 <button type="submit">Đăng nhập hệ thống</button>
//             </form>
//         </div>
//     );
// };

// export default AdminLogin;




import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import '../../style/admin/loginadmin.css'; // Đảm bảo đường dẫn này đúng

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({}); // Lưu lỗi validate
    const [serverError, setServerError] = useState(''); // Lỗi từ API
    const [isShaking, setIsShaking] = useState(false); // Hiệu ứng rung
    
    const navigate = useNavigate();

    const validate = () => {
        let tempErrors = {};
        if (!username.trim()) tempErrors.username = "Tên đăng nhập không được để trống";
        if (!password.trim()) tempErrors.password = "Mật khẩu không được để trống";
        
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setServerError('');
        
        // 1. Validate Form
        if (!validate()) {
            triggerShake();
            return;
        }

        try {
            const res = await api.post('/auth/login', { username, password });
            
            if (res.data.role !== 'admin') {
                setServerError("Bạn không có quyền truy cập khu vực Admin!");
                triggerShake();
                return;
            }

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('username', res.data.username);
            
            navigate('/admin');
        } catch (err) {
            setServerError(err.response?.data?.message || "Đăng nhập thất bại");
            triggerShake();
        }
    };

    // Hàm tạo hiệu ứng rung
    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
    };

    return (
        <div className="admin-login-page">
            <div className={`login-card ${isShaking ? 'shake' : ''}`}>
                <div className="header">
                    <h2>Quản trị hệ thống</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
                        Vui lòng đăng nhập để tiếp tục
                    </p>
                </div>

                {serverError && (
                    <div className="error-banner">
                        <i className="fa-solid fa-circle-exclamation"></i> {serverError}
                    </div>
                )}

                <form onSubmit={handleLogin} novalidate>
                    <div className="form-group">
                        <i className="fa-regular fa-user"></i>
                        <input 
                            type="text" 
                            className={errors.username ? 'invalid' : ''}
                            placeholder="Tên đăng nhập admin" 
                            value={username}
                            onChange={e => {
                                setUsername(e.target.value);
                                if(errors.username) setErrors({...errors, username: ''});
                            }}
                        />
                        {errors.username && <div className="error-hint">{errors.username}</div>}
                    </div>

                    <div className="form-group">
                        <i className="fa-regular fa-lock"></i>
                        <input 
                            type="password" 
                            className={errors.password ? 'invalid' : ''}
                            placeholder="Mật khẩu" 
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value);
                                if(errors.password) setErrors({...errors, password: ''});
                            }}
                        />
                        {errors.password && <div className="error-hint">{errors.password}</div>}
                    </div>

                    <div className="options">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Ghi nhớ</span>
                        </label>
                        <a href="#!" className="forgot-pw">Quên mật khẩu?</a>
                    </div>

                    <button type="submit" className="btn-login">
                        Đăng nhập hệ thống
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;