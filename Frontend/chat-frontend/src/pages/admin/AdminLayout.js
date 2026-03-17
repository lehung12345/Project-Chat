// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import AdminSidebar from '../../components/admin/AdminSidebar';
// import '../../style/admin/admin.css';

// const AdminLayout = () => {
//     return (
//         <div className="admin-layout">
//             <AdminSidebar />
//             <div style={{flex: 1}}>
//                 <Outlet />
//             </div>
//         </div>
//     );
// };

// export default AdminLayout;



import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import '../../style/admin/admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        if(window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi quyền Admin?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/admin/login', { replace: true });
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-content">
                <header className="admin-header">
                    <div className="admin-welcome">
                        <span style={{color: '#718096'}}>Trang quản trị /</span>
                        <strong style={{marginLeft: '5px', color: '#2d3748'}}> Xin chào, Admin</strong>
                    </div>
                    
                    <button onClick={handleLogout} className="btn-logout-admin">
                        <span>Đăng xuất</span>
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </header>

                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;