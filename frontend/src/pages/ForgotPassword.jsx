import React, { useState } from "react";
import API from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await API.post("/auth/forgot-password", { email });
    setMsg(res.data.msg);
  };

  return (
    <div className="auth-box">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit">Send Reset Link</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
