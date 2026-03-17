// import React, { useState, useRef } from 'react';
// import '../style/chat.css';

// const MessageInput = ({ onSendMessage, onSendFile }) => {
//     const [content, setContent] = useState('');
//     const fileInputRef = useRef(null);

//     const handleSend = () => {
//         if (!content.trim()) return;
//         onSendMessage(content);
//         setContent('');
//     };

//     const handleOpenFileDialog = () => {
//         fileInputRef.current.click();
//     };

//     const handleFileChange = (e) => {
//         if (e.target.files[0]) {
//             onSendFile(e.target.files[0]);
//         }
//     };

//     return (
//         <div className="message-input-area">
//             {/* Nút gửi file */}
//             <button onClick={handleOpenFileDialog} className="send-button file-button">
//                 📎
//             </button>
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileChange}
//             />

//             {/* Input gửi tin nhắn văn bản */}
//             <input
//                 type="text"
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 onKeyDown={(e) => {
//                     if (e.key === 'Enter') {
//                         handleSend();
//                     }
//                 }}
//                 placeholder="Nhập tin nhắn..."
//                 className="message-input"
//             />
            
//             {/* Nút gửi */}
//             <button onClick={handleSend} className="send-button">
//                 Gửi
//             </button>
//         </div>
//     );
// };

// export default MessageInput;





import React, { useState, useRef } from 'react';
import '../style/chat.css';
import api from '../api'; // Đảm bảo bạn đã import axios instance

const MessageInput = ({ onSendMessage, onSendFile }) => {
    const [content, setContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef(null);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

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

    // --- LOGIC VOICE CHAT ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => {
                audioChunks.current.push(e.data);
            };

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('voice', audioBlob, 'voice.webm');

                try {
                    // 1. Upload file voice lên server
                    const res = await api.post('/messages/upload-voice', formData);
                    
                    // 2. Gửi qua socket với type là 'voice'
                    // Bạn cần xử lý hàm onSendMessage ở App.js/Chat.js để nhận object này
                    onSendMessage({
                        content: 'Tin nhắn thoại',
                        voiceUrl: res.data.voiceUrl,
                        type: 'voice'
                    });
                } catch (err) {
                    console.error("Lỗi upload voice:", err);
                }
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            alert("Vui lòng cấp quyền truy cập Micro để sử dụng chức năng này!");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            // Dừng tất cả track của stream để tắt đèn báo micro
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
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

            {/* Nút Voice Chat - Nhấn giữ để ghi âm */}
            <button 
                className={`send-button voice-button ${isRecording ? 'recording' : ''}`}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording} // Dừng nếu di chuột ra ngoài khi đang giữ
                title="Giữ để ghi âm"
            >
                {isRecording ? '🔴' : '🎤'}
            </button>

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
                placeholder={isRecording ? "Đang ghi âm..." : "Nhập tin nhắn..."}
                className="message-input"
                disabled={isRecording}
            />
            
            {/* Nút gửi */}
            <button onClick={handleSend} className="send-button" disabled={isRecording}>
                Gửi
            </button>
        </div>
    );
};

export default MessageInput;