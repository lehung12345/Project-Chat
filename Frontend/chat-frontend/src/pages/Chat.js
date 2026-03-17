import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

import UserList from "../components/UserList";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

import api from "../api";
import "../style/chat.css";

const SOCKET_URL = "http://localhost:5000";

const Chat = () => {

  const navigate = useNavigate();

  const socketRef = useRef(null);

  const currentUsername = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);

  const [messages, setMessages] = useState([]);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userStatusMap, setUserStatusMap] = useState({});

  const [currentAvatar, setCurrentAvatar] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  /* ================= SOCKET ================= */

  useEffect(() => {

    if (!token || !currentUsername) return;

    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socketRef.current = socket;

    socket.emit("join", currentUsername);

    /* ONLINE USERS */

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    /* RECEIVE MESSAGE */

    socket.on("message", (msg) => {

      setMessages(prev => {

        const related =
          (msg.sender === currentUsername && msg.receiver === selectedUser) ||
          (msg.sender === selectedUser && msg.receiver === currentUsername);

        if (!related) return prev;

        return [...prev, msg];

      });

    });

    /* DELETE MESSAGE */

    socket.on("messageDeleted", ({ messageId }) => {

      setMessages(prev =>
        prev.map(m =>
          m._id === messageId
            ? {
                ...m,
                isDeleted: true,
                content: "Tin nhắn đã được thu hồi",
                fileUrl: null
              }
            : m
        )
      );

    });

    /* SEEN MESSAGE */

    socket.on("messagesSeen", ({ by }) => {

      if (by !== selectedUser) return;

      setMessages(prev => {

        const newMsgs = [...prev];

        for (let i = newMsgs.length - 1; i >= 0; i--) {

          if (newMsgs[i].sender === currentUsername) {

            newMsgs[i] = {
              ...newMsgs[i],
              status: "seen"
            };

            break;
          }
        }

        return newMsgs;

      });

    });

    return () => socket.disconnect();

  }, [token, currentUsername, selectedUser]);

  /* ================= FETCH USERS ================= */

  useEffect(() => {

    const fetchUsers = async () => {

      try {

        const res = await api.get("/users");

        const others = res.data.filter(
          u => u.username !== currentUsername
        );

        setUsers(others);

        const me = res.data.find(
          u => u.username === currentUsername
        );

        if (me) setCurrentAvatar(me.avatarUrl);

      } catch (err) {

        console.error("Lỗi lấy users:", err);

      }

    };

    fetchUsers();

  }, [currentUsername]);

  /* ================= OFFLINE STATUS ================= */

  useEffect(() => {

    if (!users.length) return;

    const fetchStatus = async () => {

      const map = {};

      for (const u of users) {

        if (!onlineUsers.includes(u.username)) {

          try {

            const res = await api.get(
              `/users/status/${u.username}`
            );

            map[u.username] = res.data.last_active;

          } catch {}

        }

      }

      setUserStatusMap(map);

    };

    fetchStatus();

  }, [users, onlineUsers]);

  /* ================= FORMAT LAST ACTIVE ================= */

  const formatLastActive = (time) => {

    if (!time) return "Hoạt động trước đó";

    const diff = Date.now() - new Date(time).getTime();

    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Vừa xong";

    if (minutes < 60) return `Hoạt động ${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `Hoạt động ${hours} giờ trước`;

    return "Hoạt động trước đó";

  };

  /* ================= SELECT USER ================= */

  const handleSelectUser = async (user) => {

    setSelectedUser(user.username);
    setSelectedUserData(user);

    try {

      const res = await api.get(
        `/messages?to=${user.username}`
      );

      setMessages(res.data);

      socketRef.current.emit("markSeen", {
        sender: user.username,
        receiver: currentUsername
      });

    } catch (err) {

      console.error("Lỗi tải tin nhắn:", err);

    }

  };

  /* ================= SEND MESSAGE ================= */

  // const handleSendMessage = (content) => {

  //   if (!content.trim() || !selectedUser) return;

  //   socketRef.current.emit("sendMessage", {
  //     sender: currentUsername,
  //     receiver: selectedUser,
  //     content,
  //     timestamp: new Date().toISOString()
  //   });

  // };



  const handleSendMessage = (data) => {
    if (!selectedUser) return;

    // 1. Phân loại dữ liệu đầu vào
    let messagePayload = {};

    if (typeof data === 'string') {
      // Nếu là tin nhắn văn bản bình thường
      if (!data.trim()) return;
      messagePayload = {
        content: data,
        type: 'text'
      };
    } else {
      // Nếu là object (tin nhắn thoại từ MessageInput truyền sang)
      messagePayload = {
        ...data // lấy content, voiceUrl, type từ object data
      };
    }

    // 2. Gửi qua Socket
    socketRef.current.emit("sendMessage", {
      sender: currentUsername,
      receiver: selectedUser,
      ...messagePayload,
      timestamp: new Date().toISOString()
    });
  };



  /* ================= SEND FILE ================= */

  // const handleSendFile = async (file) => {

  //   if (!file || !selectedUser) return;

  //   const formData = new FormData();

  //   formData.append("file", file);

  //   try {

  //     const res = await api.post(
  //       "/upload",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data"
  //         }
  //       }
  //     );

  //     socketRef.current.emit("sendMessage", {
  //       sender: currentUsername,
  //       receiver: selectedUser,
  //       content: res.data.fileName,
  //       fileUrl: res.data.fileUrl,
  //       fileType: res.data.fileType
  //     });

  //   } catch {

  //     alert("Lỗi upload file");

  //   }

  // };


  const handleSendFile = async (file) => {
    if (!file || !selectedUser) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      socketRef.current.emit("sendMessage", {
        sender: currentUsername,
        receiver: selectedUser,
        content: res.data.fileName,
        fileUrl: res.data.fileUrl,
        fileType: res.data.fileType,
        type: 'file', // Thêm trường type để phân biệt với 'voice' và 'text'
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Lỗi upload file:", err);
      alert("Lỗi upload file");
    }
  };


  /* ================= DELETE MESSAGE ================= */

  const handleDeleteMessage = (messageId, receiver) => {

    if (!window.confirm("Thu hồi tin nhắn này?")) return;

    socketRef.current.emit("deleteMessage", {
      messageId,
      receiver
    });

  };

  /* ================= AVATAR ================= */

  const handleUpdateAvatar = async (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("avatar", file);

    try {

      const res = await api.put(
        "/users/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (res.data.avatarUrl) {
        setCurrentAvatar(res.data.avatarUrl);
      }

    } catch {

      alert("Lỗi cập nhật avatar");

    }

  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {

    localStorage.clear();
    navigate("/");

  };

  /* ================= RENDER ================= */

  return (
    <div className="chat-container">

      {/* SIDEBAR */}

      <div className="profile-sidebar">

        <div
          className="profile-header"
          onClick={() =>
            setShowProfileMenu(!showProfileMenu)
          }
        >
          <img
            src={
              currentAvatar ||
              "/uploads/default_avatar.png"
            }
            className="profile-avatar"
            alt=""
          />

          <span className="profile-username">
            {currentUsername}
          </span>

        </div>

        {/* {showProfileMenu && (
          <div className="profile-menu">

            <label
              htmlFor="avatar-upload"
              className="profile-menu-item"
            >
              Thay đổi Avatar
            </label>

            <input
              id="avatar-upload"
              type="file"
              hidden
              onChange={handleUpdateAvatar}
            />

            <div
              className="profile-menu-item"
              onClick={handleLogout}
            >
              Đăng xuất
            </div>

          </div>
        )} */}


        {showProfileMenu && (
          <div className="profile-menu">

            <div
              className="profile-menu-item"
              onClick={() => navigate("/profile")}
            >
              Profile
            </div>

            <label
              htmlFor="avatar-upload"
              className="profile-menu-item"
            >
              Thay đổi Avatar
            </label>

            <input
              id="avatar-upload"
              type="file"
              hidden
              onChange={handleUpdateAvatar}
            />

            <div
              className="profile-menu-item"
              onClick={handleLogout}
            >
              Đăng xuất
            </div>

          </div>
        )}

        <UserList
          users={users}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          onlineUsers={onlineUsers}
          userStatusMap={userStatusMap}
        />

      </div>

      {/* CHAT WINDOW */}

      <div className="chat-window">

        <div className="chat-header">

          {selectedUser ? (

            <div className="chat-header-info">

              <img
                src={
                  selectedUserData?.avatarUrl ||
                  "/uploads/default_avatar.png"
                }
                className="chat-header-avatar"
                alt=""
              />

              <div>

                <div className="chat-header-username">
                  {selectedUser}
                </div>

                <div
                  className={
                    onlineUsers.includes(selectedUser)
                      ? "chat-header-status-online"
                      : "chat-header-status-offline"
                  }
                >
                  {onlineUsers.includes(selectedUser)
                    ? "Đang hoạt động"
                    : formatLastActive(userStatusMap[selectedUser])}
                </div>

              </div>

            </div>

          ) : (

            <div className="empty-chat">
              Nhấp vào tên người dùng để bắt đầu trò chuyện
            </div>

          )}

        </div>

        <div className="chat-content">

          {selectedUser ? (
            <>
              <MessageList
                messages={messages}
                selectedUserData={selectedUserData}
                onDeleteMessage={handleDeleteMessage}
              />

              <MessageInput
                onSendMessage={handleSendMessage}
                onSendFile={handleSendFile}
              />
            </>
          ) : (
            <div className="empty-chat">
              Nhấp vào danh sách bên trái để mở cuộc trò chuyện
            </div>
          )}

        </div>

      </div>

    </div>
  );

};

export default Chat;