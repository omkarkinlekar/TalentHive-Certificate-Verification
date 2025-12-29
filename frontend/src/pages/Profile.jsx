import React, { useState } from "react";
import API from "../api";
import "../styles/profile.css";

export default function ProfilePage() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [name, setName] = useState(storedUser.name || "");
  const [email, setEmail] = useState(storedUser.email || "");
  const [avatar, setAvatar] = useState(storedUser.avatar || "/user.png");
  const [preview, setPreview] = useState(storedUser.avatar || "/user.png");
  const [avatarFile, setAvatarFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [loading, setLoading] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // Handle file change
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setPreview("/user.png");
    setRemoveAvatar(true);
  };

  // Save profile
  const saveProfile = async () => {
    setLoading(true);
    try {
      let finalAvatar = storedUser.avatar;

      if (removeAvatar) {
        await API.post("/auth/remove-avatar");
        finalAvatar = null;
      }

      if (avatarFile) {
        const form = new FormData();
        form.append("avatar", avatarFile);

        const upload = await API.post("/auth/upload-avatar", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        finalAvatar = upload.data.url;
      }

      const res = await API.put("/auth/update", { name, email, avatar: finalAvatar });

      const updated = res.data.user;

      localStorage.setItem("user", JSON.stringify(updated));

      window.dispatchEvent(new CustomEvent("userUpdated", { detail: updated }));

      alert("Profile updated!");
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    }
    setLoading(false);
  };

  // Change password
  const changePassword = async () => {
    if (!oldPassword || !newPassword)
      return alert("Enter both old and new passwords");

    if (newPassword !== confirmPassword)
      return alert("Passwords do not match");

    setPwdLoading(true);
    try {
      await API.post("/auth/change-password", { oldPassword, newPassword });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      alert("Password updated!");
    } catch (err) {
      alert(err?.response?.data?.message || "Error");
    }
    setPwdLoading(false);
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-card">

        {/* Avatar */}
        <div className="avatar-box">
          <img src={preview} alt="avatar" className="avatar-img" />

          <label className="avatar-change-btn">
            Change Photo
            <input type="file" accept="image/*" onChange={handleImage} hidden />
          </label>

          <button className="avatar-remove-btn" onClick={handleRemoveAvatar}>
            Remove Photo
          </button>
        </div>

        {/* Info */}
        <div className="profile-form">
          <h2>Profile Settings</h2>

          <label>Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />

          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />

          <button className="save-btn" onClick={saveProfile} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <hr />

          <h3>Change Password</h3>

          <label>Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="save-btn" onClick={changePassword} disabled={pwdLoading}>
            {pwdLoading ? "Updating..." : "Update Password"}
          </button>
        </div>

      </div>
    </div>
  );
}
