import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../style/profile.css";

const Profile = () => {

  const navigate = useNavigate();

  const [profile,setProfile] = useState({
    username:"",
    email:"",
    address:"",
    phone:"",
    avatarUrl:""
  });

  const [oldPassword,setOldPassword] = useState("");
  const [newPassword,setNewPassword] = useState("");

  /* LOAD PROFILE */

  useEffect(()=>{

    const fetchProfile = async ()=>{

      try{

        const res = await api.get("/users/profile");

        setProfile(res.data);

      }catch(err){
        console.log(err);
      }

    };

    fetchProfile();

  },[]);

  /* INPUT */

  const handleChange = (e)=>{

    const {name,value} = e.target;

    if(name === "phone"){

      const onlyNumber = value.replace(/\D/g,"");

      if(onlyNumber.length > 10) return;

      setProfile({
        ...profile,
        phone: onlyNumber
      });

      return;

    }

    setProfile({
      ...profile,
      [name]:value
    });

  };

  /* UPDATE PROFILE */

  const handleUpdate = async ()=>{

    if(!/^0\d{9}$/.test(profile.phone)){
      alert("Số điện thoại phải 10 số và bắt đầu bằng 0");
      return;
    }

    try{

      await api.put("/users/profile",{
        address:profile.address,
        phone:profile.phone
      });

      alert("Cập nhật thành công");

    }catch(err){

      alert(err.response?.data?.message || "Lỗi cập nhật");

    }

  };

  /* CHANGE PASSWORD */

  const handleChangePassword = async ()=>{

    if(!oldPassword || !newPassword){
      alert("Nhập đầy đủ mật khẩu");
      return;
    }

    try{

      await api.put("/users/change-password",{
        oldPassword,
        newPassword
      });

      alert("Đổi mật khẩu thành công");

      setOldPassword("");
      setNewPassword("");

    }catch(err){

      alert(err.response?.data?.message || "Lỗi đổi mật khẩu");

    }

  };

  /* AVATAR URL */

  const avatar =
    profile.avatarUrl
      ? `http://localhost:5000/uploads/${profile.avatarUrl}`
      : `http://localhost:5000/uploads/default_avatar.png`;

  return(

    <div className="profile-container">

      <div className="profile-grid">

        {/* LEFT COLUMN */}

        <div className="profile-card">

          <div className="profile-avatar-box">

            <img
              src={avatar}
              className="profile-avatar"
              alt=""
            />

            <div className="profile-name">
              {profile.username}
            </div>

          </div>

          <div className="profile-field">
            <label>Username</label>
            <input value={profile.username} disabled/>
          </div>

          <div className="profile-field">
            <label>Email</label>
            <input value={profile.email} disabled/>
          </div>

          <div className="profile-field">
            <label>Address</label>
            <input
              name="address"
              value={profile.address || ""}
              onChange={handleChange}
            />
          </div>

          <div className="profile-field">
            <label>Phone</label>
            <input
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
              placeholder="0123456789"
            />
          </div>

          <button
            className="profile-btn"
            onClick={handleUpdate}
          >
            Cập nhật thông tin
          </button>

        </div>


        {/* RIGHT COLUMN */}

        <div className="profile-card">

          <div className="password-title">
            Đổi mật khẩu
          </div>

          <div className="profile-field">
            <label>Mật khẩu cũ</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e)=>setOldPassword(e.target.value)}
            />
          </div>

          <div className="profile-field">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
            />
          </div>

          <button
            className="profile-btn"
            onClick={handleChangePassword}
          >
            Đổi mật khẩu
          </button>

          <button
            className="profile-btn"
            onClick={()=>navigate("/chat")}
          >
            ← Quay lại trang chủ
          </button>

        </div>

      </div>

    </div>

  );

};

export default Profile;