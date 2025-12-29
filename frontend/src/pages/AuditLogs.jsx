import React, { useEffect, useState } from "react";
import API from "../api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  async function load() {
    try {
      const res = await API.get("/certs/audit-logs");
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
      setLogs([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function formatTime(t) {
    return new Date(t).toLocaleString();
  }

  const filtered = logs.filter(
    (log) =>
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.admin?.toLowerCase().includes(search.toLowerCase()) ||
      log.certId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="audit-container">

      <div className="top-row">
        <h2 className="page-title">Audit Logs</h2>
      </div>

      <div className="audit-card">
        {/* Search Box */}
        <input
          type="text"
          placeholder="Search logs..."
          className="audit-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filtered.length === 0 && (
          <p className="empty-msg">No logs found</p>
        )}

        <div className="logs-list">
          {filtered.map((log) => (
            <div className="log-item" key={log._id}>
              
              <div className="log-header">
                <span className="log-action">{log.action}</span>
                <span className="log-time">{formatTime(log.timestamp)}</span>
              </div>

              <div className="log-body">
                <p><strong>Admin:</strong> {log.admin}</p>
                <p><strong>Certificate:</strong> {log.certId}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
