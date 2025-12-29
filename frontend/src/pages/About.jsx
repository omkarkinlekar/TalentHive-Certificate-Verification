import React, { useEffect, useState } from "react";
import API from "../api";
import { Users, FileText } from "lucide-react";

export default function About() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCertificates: 0,
  });

  const [display, setDisplay] = useState({
    totalStudents: 0,
    totalCertificates: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const animateCount = (key, target) => {
    let start = 0;
    const step = Math.ceil(target / 60);

    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(interval);
      }
      setDisplay(prev => ({ ...prev, [key]: start }));
    }, 16);
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/certs/analytics");
      const newStats = {
        totalStudents: res.data.totalStudents || 0,
        totalCertificates: res.data.total || 0,
      };

      setStats(newStats);
      animateCount("totalStudents", newStats.totalStudents);
      animateCount("totalCertificates", newStats.totalCertificates);

    } catch (err) {
      console.log("Stats fetch error:", err);
    }
  };

  return (
    <>
      <div className="about-hero">
        <img src="/about-banner.jpg" alt="banner" />
        {/* OVERLAY STATS */}
        <div className="hero-overlay">
          <div className="stat">
            <Users className="stat-icons" />
            <div>
              <h2 className="stat-number">{display.totalStudents}</h2>
              <p>Students Registered</p>
            </div>
          </div>

          <div className="stat">
            <FileText className="stat-icons" />
            <div>
              <h2 className="stat-number">{display.totalCertificates}</h2>
              <p>Certificates Issued</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="card1">
          {/* SECTIONS */}
          <div className="card" style={{ marginTop: "20px" }}>
            <h3>Our Mission</h3>
            <p>CertiPro helps institutions and organizations issue and verify certificates with modern digital security.</p>
          </div>

          <div className="card" style={{ marginTop: "20px" }}>
            <h3>Our Vision</h3>
            <p>To become the most trusted certificate issuing platform — simple, intuitive, and secure by design.</p>
          </div>

          <div className="card elegant-card" style={{ marginTop: "40px" }}>
            <h3 className="section-title">Features We Offer</h3>

            <div className="features-grid">

              <div className="feature-item fade-in-up">
                <img src="/icons/instant.gif" alt="instant" className="feature-icon" />
                <h4>Instant Certificate Generation</h4>
                <p>Generate certificates in seconds with automated workflows.</p>
              </div>

              <div className="feature-item fade-in-up" style={{ animationDelay: "0.15s" }}>
                <img src="/icons/verify.gif" alt="verify" className="feature-icon" />
                <h4>Smart QR Verification</h4>
                <p>One-tap verification for students and companies.</p>
              </div>

              <div className="feature-item fade-in-up" style={{ animationDelay: "0.3s" }}>
                <img src="/icons/dashboard.gif" alt="dashboard" className="feature-icon" />
                <h4>Admin Analytics Dashboard</h4>
                <p>Real-time insights into certificates and users.</p>
              </div>

              <div className="feature-item fade-in-up" style={{ animationDelay: "0.45s" }}>
                <img src="/icons/cloud.gif" alt="cloud" className="feature-icon" />
                <h4>Cloud Storage</h4>
                <p>Secure cloud-stored certificate archive.</p>
              </div>

              <div className="feature-item fade-in-up" style={{ animationDelay: "0.6s" }}>
                <img src="/icons/userportal.gif" alt="portal" className="feature-icon" />
                <h4>User Self-Service Portal</h4>
                <p>Students can access, verify, and manage certificates.</p>
              </div>

              <div className="feature-item fade-in-up" style={{ animationDelay: "0.75s" }}>
                <img src="/icons/security.gif" alt="security" className="feature-icon" />
                <h4>High-End Security</h4>
                <p>Encrypted storage with layered access control.</p>
              </div>

            </div>
          </div>

          {/* TESTIMONIALS */}
          <div className="card elegant-card" style={{ marginTop: "40px" }}>
            <h3 className="section-title">What People Say</h3>

            <div className="testimonials-grid">
              <div className="testimonial-card fade-in-up">
                <p className="testimonial-text">
                  “CertiPro made our certificate issuing process 10× faster. Super smooth experience!”
                </p>
                <h4 className="testimonial-name">Rahul Sharma</h4>
                <span className="testimonial-role">Training Coordinator</span>
              </div>

              <div className="testimonial-card fade-in-up" style={{ animationDelay: "0.25s" }}>
                <p className="testimonial-text">
                  “The verification system is instant. Our students love it — highly recommended.”
                </p>
                <h4 className="testimonial-name">Priya N</h4>
                <span className="testimonial-role">Institute Admin</span>
              </div>
            </div>
          </div>

          {/* TEAM SECTION */}
          <div className="card elegant-card" style={{ marginTop: "40px" }}>
            <h3 className="section-title">Our Team</h3>

            <div className="team-grid">
              <div className="team-card fade-in-up">
                <img src="/team1.png" className="team-photo" alt="img" />
                <h4 className="team-name">Omkar Kinlekar</h4>
                <p className="team-role">Founder & Lead Developer</p>
              </div>
            </div>
          </div>

          <div className="card elegant-card" style={{ marginTop: "40px" }}>
            <h3>Get in Touch</h3>
            <div className="contact-section">
              <p>Have questions or want a custom integration? We’d love to hear from you.</p>

              <div className="contact-info">
                <span>📩 support@certipro.com</span>
                <span>💬 WhatsApp: +91 98765 43210</span>
              </div>
              <button className="contact-btn">Contact Us</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
