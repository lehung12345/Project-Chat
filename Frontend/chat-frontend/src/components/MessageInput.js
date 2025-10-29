import React, { useState, useRef } from 'react';
import '../style/chat.css';

const MessageInput = ({ onSendMessage, onSendFile }) => {
    const [content, setContent] = useState('');
    const fileInputRef = useRef(null);

    const handleSend = () => {
        if (!content.trim()) return;
        onSendMessage(content);
        setContent('');
    };

    const handleOpenFileDialog = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            onSendFile(e.target.files[0]);
        }
    };

    return (
        <div className="message-input-area">
            {/* Nút gửi file */}
            <button onClick={handleOpenFileDialog} className="send-button file-button">
                📎
            </button>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Input gửi tin nhắn văn bản */}
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSend();
                    }
                }}
                placeholder="Nhập tin nhắn..."
                className="message-input"
            />
            
            {/* Nút gửi */}
            <button onClick={handleSend} className="send-button">
                Gửi
            </button>
        </div>
    );
};

export default MessageInput;