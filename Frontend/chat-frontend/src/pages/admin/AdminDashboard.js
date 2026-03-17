// // src/pages/admin/AdminDashboard.js
// import React, { useEffect, useState } from 'react';
// import api from '../../api'; // Giả định file api.js xử lý axios của bạn
// import '../../style/admin/admin.css';

// const AdminDashboard = () => {
//     const [stats, setStats] = useState({ totalUsers: 0, totalMessages: 0, messagesToday: 0 });

//     useEffect(() => {
//         const fetchStats = async () => {
//             try {
//                 const res = await api.get('/admin/stats');
//                 setStats(res.data);
//             } catch (err) {
//                 console.error("Lỗi lấy thống kê:", err);
//             }
//         };
//         fetchStats();
//     }, []);

//     return (
//         <div className="admin-container">
//             <h2 className="admin-title">Bảng điều khiển hệ thống</h2>
//             <div className="stats-grid">
//                 <div className="stat-card blue">
//                     <h3>Tổng người dùng</h3>
//                     <p className="stat-number">{stats.totalUsers}</p>
//                 </div>
//                 <div className="stat-card green">
//                     <h3>Tổng tin nhắn</h3>
//                     <p className="stat-number">{stats.totalMessages}</p>
//                 </div>
//                 <div className="stat-card purple">
//                     <h3>Tin nhắn hôm nay</h3>
//                     <p className="stat-number">{stats.messagesToday}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AdminDashboard;




import React, { useEffect, useState } from 'react';
import api from '../../api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalMessages: 0, messagesToday: 0 });

    useEffect(() => {
        api.get('/admin/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h2 className="page-title">Hệ thống tổng quan</h2>
            <div className="stats-grid">
                <div className="stat-card blue">
                    <h3>Tổng người dùng</h3>
                    <div className="val">{stats.totalUsers}</div>
                </div>
                <div className="stat-card green">
                    <h3>Tổng tin nhắn</h3>
                    <div className="val">{stats.totalMessages}</div>
                </div>
                <div className="stat-card orange">
                    <h3>Tin nhắn hôm nay</h3>
                    <div className="val">{stats.messagesToday}</div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;