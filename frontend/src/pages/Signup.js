import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/signup", form);
      localStorage.setItem("token", res.data.token);
      // localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/login");
    } catch (err) {
      setErr(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        {err && <p className="error">{err}</p>}

        <form onSubmit={submit}>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handle} required />

          <label>Email</label>
          <input name="email" value={form.email} onChange={handle} type="email" required />

          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handle}
            required
          />

          {/* Optional dropdown */}
          <label>Role</label>
          <select name="role" value={form.role} onChange={handle}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <div style={{display: "flex", justifyContent: "center", marginTop: "10px"}}>
            <button type="submit">Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
}
