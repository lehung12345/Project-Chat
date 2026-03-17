// import React, { useEffect, useRef, useMemo } from "react";
// import "../style/chat.css";

// const MessageList = ({ messages = [], selectedUserData, onDeleteMessage }) => {

//   const currentUsername = localStorage.getItem("username");
//   const endRef = useRef(null);

//   /* tìm tin nhắn cuối cùng của mình */

//   const lastMyMessageIndex = useMemo(() => {

//     const myMessages = messages
//       .map((msg, i) => ({ ...msg, index: i }))
//       .filter(msg => msg.sender === currentUsername);

//     if (myMessages.length === 0) return -1;

//     return myMessages[myMessages.length - 1].index;

//   }, [messages, currentUsername]);

//   /* auto scroll */

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   /* format giờ */

//   const formatTime = (time) => {

//     if (!time) return "";

//     return new Date(time).toLocaleTimeString("vi-VN", {
//       hour: "2-digit",
//       minute: "2-digit"
//     });

//   };

//   return (

//     <div className="message-list">

//       {messages.map((msg, index) => {

//         const isMine = msg.sender === currentUsername;
//         const isDeleted = msg.isDeleted;

//         return (

//           <div
//             key={msg._id || index}
//             className={`message-item ${isMine ? "me" : "other"}`}
//           >

//             <div
//               className={`message ${isMine ? "sent" : "received"}`}
//               onClick={() =>
//                 isMine &&
//                 !isDeleted &&
//                 onDeleteMessage &&
//                 onDeleteMessage(msg._id, msg.receiver)
//               }
//             >

//               {isDeleted ? (

//                 <span className="deleted-message">
//                   Tin nhắn đã được thu hồi
//                 </span>

//               ) : msg.fileUrl ? (

//                 msg.fileType?.startsWith("image") ? (

//                   <img
//                     src={`http://localhost:5000${msg.fileUrl}`}
//                     alt="img"
//                     className="message-image"
//                   />

//                 ) : (

//                   <a
//                     href={`http://localhost:5000${msg.fileUrl}`}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     {msg.content || "Tệp đính kèm"}
//                   </a>

//                 )

//               ) : (

//                 <span>{msg.content}</span>

//               )}

//               {/* giờ nằm trong bubble */}
//               <span className="message-time">
//                 {formatTime(msg.timestamp)}
//               </span>

//             </div>

//             {/* avatar seen */}

//             {isMine &&
//               index === lastMyMessageIndex &&
//               msg.status === "seen" && (

//                 <img
//                   src={
//                     selectedUserData?.avatarUrl ||
//                     "/uploads/default_avatar.png"
//                   }
//                   alt="seen"
//                   className="seen-avatar"
//                 />

//               )}

//           </div>

//         );

//       })}

//       <div ref={endRef}></div>

//     </div>

//   );

// };

// export default MessageList;





import React, { useEffect, useRef, useMemo } from "react";
import "../style/chat.css";

const MessageList = ({ messages = [], selectedUserData, onDeleteMessage }) => {
  const currentUsername = localStorage.getItem("username");
  const endRef = useRef(null);
  const BASE_URL = 'http://localhost:5000';

  const lastMyMessageIndex = useMemo(() => {
    const myMessages = messages
      .map((msg, i) => ({ ...msg, index: i }))
      .filter(msg => msg.sender === currentUsername);

    if (myMessages.length === 0) return -1;
    return myMessages[myMessages.length - 1].index;
  }, [messages, currentUsername]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(time).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="message-list">
      {messages.map((msg, index) => {
        const isMine = msg.sender === currentUsername;
        const isDeleted = msg.isDeleted;

        return (
          <div
            key={msg._id || index}
            className={`message-item ${isMine ? "me" : "other"}`}
          >
            <div
              className={`message ${isMine ? "sent" : "received"} ${msg.voiceUrl ? "voice-bubble" : ""}`}
              onClick={() =>
                isMine &&
                !isDeleted &&
                onDeleteMessage &&
                onDeleteMessage(msg._id, msg.receiver)
              }
            >
              {isDeleted ? (
                <span className="deleted-message">
                  Tin nhắn đã được thu hồi
                </span>
              ) : msg.voiceUrl ? (
                /* HIỂN THỊ TIN NHẮN THOẠI */
                <div className="voice-msg-wrapper">
                  <audio 
                    controls 
                    className="voice-audio"
                    onClick={(e) => e.stopPropagation()} // Ngăn việc nhấn vào nút Play bị nhảy ra lệnh xóa
                  >
                    <source src={`${BASE_URL}${msg.voiceUrl}`} type="audio/webm" />
                    Trình duyệt không hỗ trợ.
                  </audio>
                </div>
              ) : msg.fileUrl ? (
                msg.fileType?.startsWith("image") ? (
                  <img
                    src={`${BASE_URL}${msg.fileUrl}`}
                    alt="img"
                    className="message-image"
                  />
                ) : (
                  <a
                    href={`${BASE_URL}${msg.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()} // Nhấn vào link không bị nhảy lệnh xóa
                  >
                    {msg.content || "Tệp đính kèm"}
                  </a>
                )
              ) : (
                <span>{msg.content}</span>
              )}

              <span className="message-time">
                {formatTime(msg.timestamp)}
              </span>
            </div>

            {/* Avatar trạng thái đã xem */}
            {isMine &&
              index === lastMyMessageIndex &&
              msg.status === "seen" && (
                <img
                  src={
                    selectedUserData?.avatarUrl ||
                    "/uploads/default_avatar.png"
                  }
                  alt="seen"
                  className="seen-avatar"
                />
              )}
          </div>
        );
      })}
      <div ref={endRef}></div>
    </div>
  );
};

export default MessageList;