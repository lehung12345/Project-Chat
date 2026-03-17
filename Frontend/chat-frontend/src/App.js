// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Chat from './pages/Chat';
// import PrivateRoute from './routes/PrivateRoute';
// import Profile from "./pages/Profile";
// //admin
// import AdminLayout from './pages/admin/AdminLayout';
// import AdminDashboard from './pages/admin/AdminDashboard';
// import UserManagement from './pages/admin/UserManagement';
// import MessageLog from './pages/admin/MessageLog';

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/profile" element={<Profile />} />
//         <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
//         {/* admin router */}
//         <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminLayout /></PrivateRoute>}>
//             <Route index element={<AdminDashboard />} />
//             <Route path="users" element={<UserManagement />} />
//             <Route path="messages" element={<MessageLog />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// };

// export default App;





import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from "./pages/Profile";
import PrivateRoute from './routes/PrivateRoute';

// Admin
import AdminLogin from './pages/admin/AdminLogin'; 
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import MessageLog from './pages/admin/MessageLog';

const App = () => {
    return (
        <Router>
            <Routes>
                {/* --- CỔNG NGƯỜI DÙNG --- */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Chỉ cho User vào, Admin bị PrivateRoute chặn dựa trên role */}
                <Route path="/chat" element={<PrivateRoute adminOnly={false}><Chat /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute adminOnly={false}><Profile /></PrivateRoute>} />

                {/* --- CỔNG ADMIN --- */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Chỉ cho Admin vào, User thường bị chặn hoàn toàn */}
                <Route path="/admin" element={<PrivateRoute adminOnly={true}><AdminLayout /></PrivateRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="messages" element={<MessageLog />} />
                </Route>

                {/* Điều hướng mặc định */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;