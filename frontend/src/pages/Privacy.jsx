import React from "react";

export default function Privacy() {
  return (
    <div className="container">
      <div className="card1">
        <h2 className="section-title">Privacy Policy</h2>
        <p className="text-muted">Last updated: {new Date().toDateString()}</p>

        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Data We Collect</h3>
          <p>
            CertiPro collects only required information such as your name, email,
            profile image, and certificate records to provide platform
            functionality.
          </p>
        </div>

        <div className="card" style={{ marginTop: "20px" }}>
          <h3>How We Use Your Data</h3>
          <ul>
            <li>To generate certificates</li>
            <li>To allow secure verification</li>
            <li>To maintain your account</li>
            <li>To enhance platform performance</li>
          </ul>
        </div>

        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Security</h3>
          <p>
            CertiPro uses encrypted storage, JWT authentication and secure API
            design to protect all user information.
          </p>
        </div>

        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Your Rights</h3>
          <p>
            You can update or delete your personal data anytime within your
            profile settings or by contacting support.
          </p>
        </div>
      </div>
    </div>
  );
}
