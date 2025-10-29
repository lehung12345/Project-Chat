import React from 'react';
import '../style/chat.css';

const UserList = ({ users, onSelectUser, selectedUser }) => {
  return (
    <div className="user-list">
      <h3>Người dùng</h3>
      {users.length === 0 && <p>Không có người dùng nào khác.</p>}
      {users.map((user, index) => (
        <div
          key={index}
          className={`user-item ${selectedUser === user.username ? 'active' : ''}`}
          onClick={() => onSelectUser(user)}
        >
          <img src={user.avatarUrl} alt="User Avatar" className="user-avatar" />
          <span>{user.username}</span>
        </div>
      ))}
    </div>
  );
};

export default UserList;
