import React, { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

import { FileText, Users, Timer } from "lucide-react";
import { User, BookOpen, Calendar, Hash , Mail} from "lucide-react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function AdminPanel() {
  const [list, setList] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    totalStudents: 0,
    avgDuration: 0,
  });
  
  const [domainList, setDomainList] = useState([]);
  const [monthList, setMonthList] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [search, setSearch] = useState("");

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A020F0",
    "#FF4444",
    "#32CD32",
    "#FF69B4",
    "#6A5ACD",
    "#20B2AA"
  ];

  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  async function load() {
    try {
      const res = await API.get("/certs/list");
      setList(res.data.list || []);
    } catch {
      setList([]);
    }

    try {
      const a = await API.get("/certs/analytics");
      setAnalytics(a.data);

      setDomainList(
        Object.keys(a.data.domainStats).map(key => ({
          name: key,
          value: a.data.domainStats[key]
        }))
      );

      setMonthList(
        a.data.perMonth.map((v, i) => ({
          month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
          value: v
        }))
      );

      setYearList(
        Object.keys(a.data.perYear).map(y => ({
          year: y,
          value: a.data.perYear[y]
        }))
      );
    } catch {}
  }

  useEffect(() => {
    load();
  }, []);

  async function saveEdit() {
    await API.put(`/certs/edit/${editData._id}`, editData);
    setEditData(null);
    load();
  }

  async function deleteCert() {
    await API.delete(`/certs/delete/${deleteId}`);
    setDeleteId(null);
    load();
  }

  const filteredList = list.filter(c =>
    `${c.studentName} ${c.courseName} ${c.certificateId}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ⭐ EXPORT TO EXCEL FUNCTION
  function exportToExcel() {
    if (filteredList.length === 0) {
      alert("No certificates to export!");
      return;
    }

    const data = filteredList.map((c, index) => ({
      SNo: index + 1,
      StudentName: c.studentName,
      CourseName: c.courseName,
      CertificateID: c.certificateId,
      IssueDate: new Date(c.issueDate).toLocaleDateString(),
      StartDate: c.meta?.startDate 
        ? new Date(c.meta.startDate).toLocaleDateString()
        : "",
      EndDate: c.meta?.endDate
        ? new Date(c.meta.endDate).toLocaleDateString()
        : "",
      PDFLink: `http://localhost:5000${c.pdfPath.replace("/public", "")}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Certificates");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "certificates.xlsx");
  }

  return (
    <div className="admin-container-vertical">

      {/* === ANALYTICS + CHARTS === */}
      <div className="card combined-analytics">
        <h2 className="section-title">Analytics Summary</h2>

        <div className="analytics-stats">
          <div className="stat-box">
            <FileText className="stat-icon"/>
            <h2>{analytics.total}</h2>
            <p>Total Certificates</p>
          </div>

          <div className="stat-box">
            <Users className="stat-icon"/>
            <h2>{analytics.totalStudents}</h2>
            <p>Total Students</p>
          </div>

          <div className="stat-box">
            <Timer className="stat-icon"/>
            <h2>{analytics.avgDuration.toFixed(1)} days</h2>
            <p>Avg Duration</p>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-box">
            <h4>By Domain</h4>
            {(() => {
    const domainData =
      domainList.length > 0
        ? domainList
        : [{ name: "No Data", value: 1 }];

    return (
      <PieChart width={300} height={250}>
        <Pie
          data={domainData}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={domainList.length > 0} // hide labels when empty
        >
          {domainData.map((entry, i) => (
            <Cell
              key={i}
              fill={
                domainList.length === 0
                  ? "#D3D3D3" // grey fallback color
                  : COLORS[i % COLORS.length]
              }
            />
          ))}
        </Pie>

        <Tooltip />

        {/* Optional: show legend only when real data exists */}
        {domainList.length > 0 && <Legend />}
      </PieChart>
    );
  })()}
          </div>

          <div className="chart-box">
            <h4>Monthly (Current Year)</h4>
            <BarChart width={300} height={250} data={monthList}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0088FE" />
            </BarChart>
          </div>

          <div className="chart-box">
            <h4>Per Year</h4>
            <LineChart width={300} height={250} data={yearList}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#FF8042" strokeWidth={3} />
            </LineChart>
          </div>
        </div>
      </div>

      {/* === TABS === */}
      <div className="tabs-center">
        <div className="tabs">
          <button className="active">Certificates</button>
          <Link to="/upload"><button>Upload & Generate</button></Link>
          <Link to="/audit-logs"><button>Audit Logs</button></Link>
        </div>
      </div>

      {/* === CERTIFICATES SECTION === */}
      <div className="card certificates-section">

        {/* Title + Export Excel Button */}
        <div className="section-title"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Latest Certificates</h2>

          {filteredList.length > 0 && (
            <button
              onClick={exportToExcel}
              className="export-btn"
              style={{
                padding: "8px 14px",
                background: "#0088FE",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Export Excel
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Search certificates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="scroll-box">
          {filteredList.length === 0 && <p>No certificates found</p>}

          {filteredList.map((c) => (
            <div className="cert-item" key={c._id}>
  
  <div className="cert-row">
    <User size={18} className="cert-icon" />
    <strong>{c.studentName}</strong>
  </div>

  <div className="cert-row">
    <Mail size={18} className="cert-icon" />
    <strong>{c.email}</strong>
  </div>

  <div className="cert-row">
    <BookOpen size={18} className="cert-icon" />
    <span>{c.courseName}</span>
  </div>

  <div className="cert-row">
    <Calendar size={18} className="cert-icon" />
    <span>{new Date(c.issueDate).toLocaleDateString()}</span>
  </div>

  <div className="cert-row">
    <Hash size={18} className="cert-icon" />
    <small>{c.certificateId}</small>
  </div>

  <div className="cert-row">
    <FileText size={18} className="cert-icon" />
    <a
      href={`http://localhost:5000${c.pdfPath.replace("/public", "")}`}
      target="_blank"
      rel="noreferrer"
    >
      PDF
    </a>
  </div>

  <div className="cert-buttons">
    <button onClick={() => setEditData({ ...c })} className="edit-btn">
      Edit
    </button>

    <button
      onClick={() => setDeleteId(c._id)}
      className="delete-btn"
    >
      Delete
    </button>
  </div>

</div>
          ))}
        </div>
      </div>

      {/* ===================== EDIT MODAL ===================== */}
      {editData && (
  <div className="modal-overlay"
  onClick={() => setEditData(null)} >
    <div 
      className="modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Edit Certificate</h3>

      <label>Student Name</label>
      <input
        type="text"
        value={editData.studentName}
        onChange={(e) =>
          setEditData({ ...editData, studentName: e.target.value })
        }
      />

      <label>Course / Domain</label>
      <input
        type="text"
        value={editData.courseName}
        onChange={(e) =>
          setEditData({ ...editData, courseName: e.target.value })
        }
      />

      <label>Start Date</label>
      <input
        type="date"
        value={editData.meta?.startDate?.slice(0, 10)}
        onChange={(e) =>
          setEditData({
            ...editData,
            meta: { ...editData.meta, startDate: e.target.value },
          })
        }
      />

      <label>End Date</label>
      <input
        type="date"
        value={editData.meta?.endDate?.slice(0, 10)}
        onChange={(e) =>
          setEditData({
            ...editData,
            meta: { ...editData.meta, endDate: e.target.value },
          })
        }
      />

      <div style={{ marginTop: 15 }}>
        <button onClick={saveEdit}>Save</button>
        <button
          onClick={() => setEditData(null)}
          style={{ marginLeft: 10 }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* ================== DELETE CONFIRMATION MODAL ================== */}
      {deleteId && (
      <div
        className="modal-overlay"
        onClick={() => setDeleteId(null)}
      >
        <div
          className="modal"
          onClick={(e) => e.stopPropagation()}
        >
          <h3>Confirm Delete?</h3>
          <p>This action cannot be undone.</p>

          <button
            onClick={deleteCert}
            style={{ background: "red", color: "white" }}
          >
            Delete
          </button>

          <button
            onClick={() => setDeleteId(null)}
            style={{ marginLeft: 10 }}
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    </div>
  );
}
