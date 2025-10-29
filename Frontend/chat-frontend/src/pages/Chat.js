import React, { useState, useEffect, useRef } from 'react';
import UserList from '../components/UserList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import { io } from 'socket.io-client';
import api from '../api';
import '../style/chat.css';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [currentAvatar, setCurrentAvatar] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const currentUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('join', currentUsername);

        const messageHandler = (message) => {
            if (
                (message.sender === selectedUser && message.receiver === currentUsername) ||
                (message.sender === currentUsername && message.receiver === selectedUser)
            ) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        };

        newSocket.on('message', messageHandler);

        return () => {
            newSocket.off('message', messageHandler);
            newSocket.close();
        };
    }, [selectedUser, currentUsername]);

    useEffect(() => {
        const fetchUsersAndCurrentUser = async () => {
            try {
                const res = await api.get('/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const filteredUsers = res.data.filter(u => u.username !== currentUsername);
                setUsers(filteredUsers);

                const currentUserData = res.data.find(u => u.username === currentUsername);
                if (currentUserData) {
                    setCurrentAvatar(currentUserData.avatarUrl);
                }
            } catch (error) {
                console.error("Không thể lấy danh sách người dùng hoặc thông tin người dùng hiện tại", error);
            }
        };
        fetchUsersAndCurrentUser();
    }, [currentUsername, token]);

    const handleSelectUser = (user) => {
        setSelectedUser(user.username);
        setSelectedUserData(user);
        setMessages([]);
    };

    const handleSendMessage = (content) => {
        if (!socket || !selectedUser) return;
        const message = {
            sender: currentUsername,
            to: selectedUser,
            content
        };
        socket.emit('sendMessage', message);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleUpdateAvatar = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            alert("Không có file nào được chọn.");
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await api.put('/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data.avatarUrl) {
                setCurrentAvatar(res.data.avatarUrl);
                alert('Avatar đã được cập nhật thành công!');
                setShowProfileMenu(false);
            }
        } catch (error) {
            console.error('Lỗi cập nhật avatar:', error);
            alert('Cập nhật avatar thất bại.');
        }
    };
    
    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    return (
        <div className="chat-container">
            <div className="profile-sidebar">
                <div className="profile-header" onClick={toggleProfileMenu}>
                    <img src={currentAvatar || '/uploads/default_avatar.png'} alt="My Avatar" className="profile-avatar" />
                    <span className="profile-username">{currentUsername}</span>
                </div>
                {showProfileMenu && (
                    <div className="profile-menu" ref={profileMenuRef}>
                        <label htmlFor="avatar-upload" className="profile-menu-item">
                            Thay đổi Avatar
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleUpdateAvatar}
                        />
                        <div className="profile-menu-item" onClick={handleLogout}>
                            Đăng xuất
                        </div>
                    </div>
                )}
                <UserList users={users} onSelectUser={handleSelectUser} selectedUser={selectedUser} />
            </div>

            <div className="chat-window">
                <div className="chat-header">
                    {selectedUser ? (
                        <>
                            <img src={selectedUserData?.avatarUrl || '/uploads/default_avatar.png'} alt="User Avatar" className="chat-header-avatar" />
                            <span className="chat-header-username">{selectedUser}</span>
                        </>
                    ) : (
                        <h4>Nhấp vào tên người dùng để bắt đầu trò chuyện.</h4>
                    )}
                </div>
                {selectedUser ? (
                    <>
                        <MessageList selectedUser={selectedUser} messages={messages} setMessages={setMessages} />
                        <MessageInput onSendMessage={handleSendMessage} />
                    </>
                ) : (
                    <div className="empty-chat">
                        Nhấp vào danh sách bên trái để mở cuộc trò chuyện.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
