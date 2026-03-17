import React from 'react';
import '../style/chat.css';

const UserList = ({ users, onSelectUser, selectedUser, onlineUsers }) => {

  const renderStatus = (user) => {
    // ONLINE
    if (onlineUsers.includes(user.username)) {
      return <span className="user-status online">Đang hoạt động</span>;
    }

    // OFFLINE nhưng chưa từng hoạt động
    if (!user.last_active) {
      return <span className="user-status offline">Hoạt động trước đó</span>;
    }

    // OFFLINE có last_active
    const lastActive = new Date(user.last_active);
    const diffMinutes = Math.floor(
      (Date.now() - lastActive.getTime()) / 60000
    );

    return (
      <span className="user-status offline">
        Hoạt động {diffMinutes} phút trước
      </span>
    );
  };

  return (
    <div className="user-list">
      <h3>Người dùng</h3>

      {users.map((user, index) => (
        <div
          key={index}
          className={`user-item ${selectedUser === user.username ? 'active' : ''}`}
          onClick={() => onSelectUser(user)}
        >
          <img src={user.avatarUrl} alt="avatar" className="user-avatar" />

          <div className="user-info">
            <span className="username">
              {user.username}
              {/* THÊM Ở ĐÂY: Nhãn Admin cho người dùng khác trong danh sách */}
              {user.role === 'admin' && (
                <span className="admin-badge" style={{ 
                  color: '#ff4d4f', 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  marginLeft: '5px',
                  border: '1px solid #ff4d4f',
                  padding: '0 4px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>Admin</span>
              )}
            </span>
            {renderStatus(user)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;