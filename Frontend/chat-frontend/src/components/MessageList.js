import React, { useEffect, useRef } from 'react';
import api from '../api';
import '../style/chat.css';

const MessageList = ({ selectedUser, messages, setMessages }) => {
    const currentUsername = localStorage.getItem('username');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!selectedUser) return;
        const fetchMessages = async () => {
            try {
                // ⭐ Sửa lỗi: Cần truyền cả user hiện tại và user được chọn
                const res = await api.get(`/messages?to=${selectedUser}&from=${currentUsername}`);
                setMessages(res.data);
            } catch (err) {
                console.error("Không lấy được tin nhắn", err);
            }
        };
        fetchMessages();
    }, [selectedUser, setMessages, currentUsername]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const isImageUrl = (url) => {
        return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    };

    return (
        <div className="message-list">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`message ${msg.sender === currentUsername ? 'sent' : 'received'}`}
                >
                    {isImageUrl(msg.content) ? (
                        <img src={`http://localhost:5000${msg.content}`} alt="Attachment" className="message-image" />
                    ) : (
                        <span>{msg.content}</span>
                    )}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;