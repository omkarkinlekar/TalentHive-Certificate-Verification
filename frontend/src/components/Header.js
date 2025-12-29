import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(stored);
  const navigate = useNavigate();

  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef();
  const headerRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    function onStorage(e) {
      if (e.key === "user") {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      }
    }

    function onUserUpdated(e) {
      const updated = e?.detail || JSON.parse(localStorage.getItem("user") || "null");
      setUser(updated);
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("userUpdated", onUserUpdated);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("userUpdated", onUserUpdated);
    };
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className="header">
      <div className="logo">
        <img src="/logo.png" alt="logo" style={{ width: "50px", height: "50px" }} />
        <h1 style={{color:"white"}}>CertiPro</h1>
      </div>

      <nav className="nav-links">
        {user?.role === "admin" && <Link style={{color:"white"}} to="/admin">Dashboard</Link>}

        {!user ? (
          <>
            <Link style={{color:"white"}} to="/login">Login</Link>
            <Link style={{color:"white"}} to="/signup">Signup</Link>
          </>
        ) : (
          <>
            {user?.role === "user" && (
              <>
                <Link style={{color:"white"}} to="/user-dashboard">Dashboard</Link>
                <Link style={{color:"white"}} to="/verify">Verify</Link>
              </>
            )}

            <div className="profile-wrapper" ref={dropdownRef}>
              <img
                src={user?.avatar || "/user.jpg"}
                alt="avatar"
                className="header-avatar"
                onClick={() => setOpenProfile(!openProfile)}
              />

              {openProfile && (
                <div className="profile-dropdown">
                  <p className="dropdown-name">{user?.name || user?.email}</p>
                  <Link
                    to="/user-dashboard-profile"
                    className="dropdown-item"
                    onClick={() => setOpenProfile(false)}
                  >
                    My Profile
                  </Link>
                  <button className="dropdown-item logout-btn" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
