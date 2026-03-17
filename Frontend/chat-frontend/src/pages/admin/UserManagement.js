// // src/pages/admin/UserManagement.js
// import React, { useEffect, useState } from 'react';
// import api from '../../api';
// import '../../style/admin/admin.css';

// const UserManagement = () => {
//     const [users, setUsers] = useState([]);

//     const loadUsers = async () => {
//         try {
//             const res = await api.get('/admin/users');
//             setUsers(res.data);
//         } catch (err) {
//             alert("Không thể tải danh sách người dùng");
//         }
//     };

//     const handleDelete = async (username) => {
//         if (window.confirm(`Bạn có chắc muốn xóa user ${username}?`)) {
//             try {
//                 await api.delete(`/admin/users/${username}`);
//                 alert("Xóa thành công");
//                 loadUsers(); // Refresh danh sách
//             } catch (err) {
//                 alert(err.response?.data?.message || "Lỗi khi xóa");
//             }
//         }
//     };

//     useEffect(() => { loadUsers(); }, []);

//     return (
//         <div className="admin-container">
//             <h2 className="admin-title">Quản lý người dùng</h2>
//             <div className="table-wrapper">
//                 <table className="admin-table">
//                     <thead>
//                         <tr>
//                             <th>Username</th>
//                             <th>Email</th>
//                             <th>Vai trò</th>
//                             <th>SĐT</th>
//                             <th>Hành động</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {users.map(u => (
//                             <tr key={u.username}>
//                                 <td>{u.username}</td>
//                                 <td>{u.email}</td>
//                                 <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
//                                 <td>{u.phone || 'N/A'}</td>
//                                 <td>
//                                     <button 
//                                         onClick={() => handleDelete(u.username)}
//                                         className="btn-delete"
//                                     >
//                                         Xóa
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default UserManagement;





import React, { useEffect, useState } from 'react';
import api from '../../api';
import '../../style/admin/admin.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // Lưu user để hiển thị Modal chi tiết

    // 1. Hàm tải danh sách người dùng từ Server
    const loadUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Lỗi tải người dùng:", err);
            alert("Không thể tải danh sách người dùng");
        }
    };

    // 2. Hàm Xóa người dùng (Hàm này bạn đã bị thiếu dẫn đến lỗi 'handleDelete' is not defined)
    const handleDelete = async (username) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}" không?`)) {
            try {
                await api.delete(`/admin/users/${username}`);
                alert("Xóa người dùng thành công!");
                loadUsers(); // Tải lại danh sách sau khi xóa để cập nhật giao diện
            } catch (err) {
                console.error("Lỗi khi xóa:", err);
                alert(err.response?.data?.message || "Đã xảy ra lỗi khi xóa người dùng");
            }
        }
    };

    // Chạy hàm loadUsers khi component được hiển thị lần đầu
    useEffect(() => { 
        loadUsers(); 
    }, []);

    // URL cơ sở để hiển thị ảnh avatar
    const BASE_URL = 'http://localhost:5000/uploads/';

    return (
        <div className="admin-container">
            <h2 className="admin-title">Quản lý người dùng</h2>
            <div className="table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.username}>
                                <td>
                                    <img 
                                        src={u.avatarUrl ? `${BASE_URL}${u.avatarUrl}` : `${BASE_URL}default_avatar.png`} 
                                        alt="avatar" 
                                        className="admin-list-avatar"
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                </td>
                                <td><strong>{u.username}</strong></td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`role-badge ${u.role}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>
                                    <div className="admin-actions">
                                        <button className="btn-view" onClick={() => setSelectedUser(u)}>
                                            <i className="fas fa-eye"></i> Xem
                                        </button>
                                        <button 
                                            className="btn-delete" 
                                            onClick={() => handleDelete(u.username)}
                                        >
                                            <i className="fas fa-trash-alt"></i> Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL HIỂN THỊ CHI TIẾT USER --- */}
            {selectedUser && (
                <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Thông tin chi tiết người dùng</h3>
                            <button className="close-modal" onClick={() => setSelectedUser(null)}>&times;</button>
                        </div>
                        <div className="modal-body user-profile-detail">
                            <div className="detail-avatar-section">
                                <img 
                                    src={selectedUser.avatarUrl ? `${BASE_URL}${selectedUser.avatarUrl}` : `${BASE_URL}default_avatar.png`} 
                                    alt="User Avatar" 
                                />
                                <h4>{selectedUser.username}</h4>
                                <span className={`role-badge ${selectedUser.role}`}>{selectedUser.role}</span>
                            </div>
                            <div className="detail-info-section">
                                <div className="info-item">
                                    <label><i className="fas fa-envelope"></i> Email:</label>
                                    <span>{selectedUser.email}</span>
                                </div>
                                <div className="info-item">
                                    <label><i className="fas fa-phone"></i> Điện thoại:</label>
                                    <span>{selectedUser.phone || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="info-item">
                                    <label><i className="fas fa-map-marker-alt"></i> Địa chỉ:</label>
                                    <span>{selectedUser.address || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="info-item">
                                    <label><i className="fas fa-calendar-alt"></i> Ngày tham gia:</label>
                                    <span>{new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;