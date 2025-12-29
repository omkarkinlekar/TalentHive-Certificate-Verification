import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles/userDashboard.css"; // create this file (styles below)

export default function UserDashboard() {
  const [certs, setCerts] = useState([]);

  async function load() {
    try {
      const res = await API.get("/certs/my");  // <-- Logged-in user's certificates
      setCerts(res.data.list || []);
    } catch (err) {
      console.error(err);
      setCerts([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="user-dash-container">
      <h2 className="dash-title">My Certificates</h2>

      {certs.length === 0 && <p>No certificates issued yet.</p>}

      <div className="cert-grid">
        {certs.map((c) => (
          <div className="cert-card" key={c._id}>
            <div className="cert-header">
              <span className="verified-badge">✔ Verified</span>
            </div>

            <h3 className="cert-name">{c.studentName}</h3>
            <p className="cert-course">{c.courseName}</p>
            <p className="cert-date">
              Issued on: {new Date(c.issueDate).toLocaleDateString()}
            </p>

            <a
              className="pdf-btn"
              href={`http://localhost:5000${c.pdfPath.replace("/public", "")}`}
              target="_blank"
              rel="noreferrer"
            >
              View Certificate
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
