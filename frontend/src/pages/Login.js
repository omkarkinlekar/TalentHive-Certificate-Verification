import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login(){
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.user.role === "admin") navigate("/admin");
      else navigate("/user-dashboard");
    } catch (err) {
      setErr(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container">
      <div className="auth-card">
        <h2>Login</h2>
        {err && <p className="error">{err}</p>}
        <form onSubmit={submit}>
          <label>Email</label>
          <input name="email" value={form.email} onChange={handle} required />
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handle} required />
          <div style={{ marginTop: "5px" ,textAlign: "right" }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
