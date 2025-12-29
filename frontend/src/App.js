import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminPanel from "./pages/AdminPanel";
import UploadMapGenerate from "./pages/UploadMapGenerate";
import Verify from "./pages/Verify";
import User from "./pages/userDashboard";
import Userprofile from "./pages/Profile";
import AuditLogs from "./pages/AuditLogs";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
    <div className="app-container">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/verify" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        <Route path="/user-dashboard" element={<User/>}/>
        <Route path="/user-dashboard-profile" element={<Userprofile/>}/>
        <Route path="/upload" element={<PrivateRoute><UploadMapGenerate /></PrivateRoute>} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/verify/:certificateId" element={<Verify />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/support" element={<Support />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      <Footer />
    </div>
    </BrowserRouter>
  );
}
