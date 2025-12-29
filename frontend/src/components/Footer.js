import React, { useRef, useEffect } from "react";

export default function Footer() {
  const footerRef = useRef(null);

  // Gradient follows mouse
  useEffect(() => {
    const footer = footerRef.current;

    function handleMouseMove(e) {
      const rect = footer.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      footer.style.setProperty("--x", `${x}%`);
      footer.style.setProperty("--y", `${y}%`);
    }

    footer.addEventListener("mousemove", handleMouseMove);
    return () => footer.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <footer ref={footerRef} className="footer fancy-gradient-footer">
      <div className="footer-content">
        <h3 style={{color:"white"}}>TalentHive Pvt. Ltd.</h3>
        <p style={{color:"white"}}>Empowering digital certification with trust and transparency.</p>
      </div>
      <div className="footer-links">
        <a href="/about">About</a>
        <a href="/support">Support</a>
        <a href="/privacy">Privacy</a>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} TalentHive Pvt. Ltd. | All rights reserved.
      </div>
    </footer>
  );
}
