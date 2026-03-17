import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
    const location = useLocation();
    const activeClass = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="admin-sidebar">
            <div className="sidebar-brand">ADMIN PANEL</div>
            <nav className="sidebar-nav">
                <Link to="/admin" className={`nav-item ${activeClass('/admin')}`}>
                    <i className="fas fa-chart-line"></i> Dashboard
                </Link>
                <Link to="/admin/users" className={`nav-item ${activeClass('/admin/users')}`}>
                    <i className="fas fa-users"></i> Quản lý User
                </Link>
                <Link to="/admin/messages" className={`nav-item ${activeClass('/admin/messages')}`}>
                    <i className="fas fa-envelope"></i> Tin nhắn hệ thống
                </Link>
            </nav>
        </div>
    );
};

export default AdminSidebar;