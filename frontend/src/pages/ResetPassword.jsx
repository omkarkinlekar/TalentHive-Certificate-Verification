import React, { useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await API.post(`/auth/reset-password/${token}`, {
      newPassword: password,
    });

    setMsg(res.data.msg);
  };

  return (
    <div className="auth-box">
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Reset</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
