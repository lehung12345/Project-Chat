// // import React from 'react';
// // import { Navigate } from 'react-router-dom';

// // const PrivateRoute = ({ children }) => {
// //   const token = localStorage.getItem('token');
// //   return token ? children : <Navigate to="/" />; // Đã sửa từ "/login" thành "/"
// // };

// // export default PrivateRoute;



// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const PrivateRoute = ({ children, adminOnly = false }) => {
//   const token = localStorage.getItem('token');
//   const userRole = localStorage.getItem('role'); // Lưu role khi login thành công

//   if (!token) {
//     return <Navigate to="/" />;
//   }

//   if (adminOnly && userRole !== 'admin') {
//     return <Navigate to="/chat" />; // Nếu không phải admin, đẩy về trang chat
//   }

//   return children;
// };

// export default PrivateRoute;


import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // 1. Chưa đăng nhập
    if (!token) {
        return adminOnly ? <Navigate to="/admin/login" replace /> : <Navigate to="/" replace />;
    }

    // 2. Nếu là ADMIN nhưng cố tình vào trang của USER (Chat, Profile...)
    if (!adminOnly && userRole === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    // 3. Nếu là USER nhưng cố tình vào trang ADMIN
    if (adminOnly && userRole !== 'admin') {
        return <Navigate to="/chat" replace />;
    }

    return children;
};

export default PrivateRoute;