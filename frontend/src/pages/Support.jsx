import React from "react";

export default function Support() {
  return (
    <div className="container">
      <div className="card1">
        <h2 className="section-title">Support</h2>
        <p className="text-muted">
          We're here to help you with everything related to CertiPro.
        </p>

        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Contact Us</h3>
          <p>Email: <b>support@certipro.com</b></p>
          <p>Response time: 24–48 hours</p>
        </div>

        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Frequently Asked Questions</h3>

          <div className="card" style={{ marginTop: "12px" }}>
            <h4>How do I verify a certificate?</h4>
            <p>Use the Verify page or scan the QR code on the certificate.</p>
          </div>

          <div className="card" style={{ marginTop: "12px" }}>
            <h4>How do I download my certificate?</h4>
            <p>Go to Dashboard → My Certificates.</p>
          </div>

          <div className="card" style={{ marginTop: "12px" }}>
            <h4>How do I change my profile picture?</h4>
            <p>Open dropdown → My Profile → Upload new avatar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
