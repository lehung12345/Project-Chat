import React, { useEffect, useState } from 'react';
import api from '../../api';
import '../../style/admin/admin.css';

const MessageLog = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await api.get('/admin/messages');
                setMessages(res.data);
            } catch (err) {
                console.error("Lỗi lấy tin nhắn");
            }
        };
        fetchMessages();
    }, []);

    return (
        <div className="admin-main">
            <h2>Toàn bộ tin nhắn hệ thống</h2>
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Người gửi</th>
                            <th>Người nhận</th>
                            <th>Nội dung</th>
                            <th>Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.map((m, index) => (
                            <tr key={index}>
                                <td style={{fontWeight: 'bold'}}>{m.sender}</td>
                                <td>{m.receiver}</td>
                                <td>{m.content}</td>
                                <td style={{fontSize: '12px', color: '#888'}}>
                                    {new Date(m.timestamp).toLocaleString('vi-VN')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MessageLog;