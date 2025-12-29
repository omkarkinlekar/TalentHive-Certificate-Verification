import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

export default function Verify() {
  const { certificateId } = useParams();

  const [id, setId] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  // Auto verify if URL contains /verify/:certificateId
  useEffect(() => {
    if (certificateId) {
      setId(certificateId);
      checkFromURL(certificateId);
    }
  }, [certificateId]);

  const checkFromURL = async (cid) => {
    setErr("");
    setResult(null);
    try {
      const res = await API.get(`/certs/verify/${encodeURIComponent(cid)}`);
      setResult(res.data);
    } catch (err) {
      setErr("Invalid certificate");
    }
  };

  // Search suggestions
  useEffect(() => {
    if (id.length < 2) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(() => {
      API.get(`/certs/search?q=${encodeURIComponent(id)}`)
        .then(res => setSuggestions(res.data))
        .catch(() => setSuggestions([]));
    }, 200);

    return () => clearTimeout(delay);
  }, [id]);

  const check = async (e) => {
    e.preventDefault();
    setErr("");
    setResult(null);
    setSuggestions([]);

    try {
      const res = await API.get(`/certs/verify/${encodeURIComponent(id)}`);
      setResult(res.data);
    } catch (err) {
      setErr("Not found");
    }
  };

  const selectSuggestion = (cid) => {
    setId(cid);
    setSuggestions([]);
  };

  return (
    <div className="container">
      <div className="auth-card">
        <h2>Verify Certificate</h2>

        <form onSubmit={check} style={{ position: "relative" }}>
          <label>Certificate ID</label>

          <input
            value={id}
            onChange={e => setId(e.target.value)}
            placeholder="e.g. TH-ABC123"
            autoComplete="off"
          />

          {suggestions.length > 0 && (
            <ul className="suggestion-box">
              {suggestions.map((s) => (
                <li key={s._id} onClick={() => selectSuggestion(s.certificateId)}>
                  {s.certificateId}
                </li>
              ))}
            </ul>
          )}

          <button type="submit">Verify</button>
        </form>

        {err && <p className="error">{err}</p>}

        {result && result.valid && (
          <div className="card">
            <h3>Valid Certificate</h3>
            <p><strong>Name:</strong> {result.certificate.studentName}</p>
            <p><strong>Course:</strong> {result.certificate.courseName}</p>
            <p><strong>Issued:</strong> {new Date(result.certificate.issueDate).toLocaleDateString()}</p>
            <p><a href={result.certificate.pdfPath} target="_blank" rel="noreferrer">Download PDF</a></p>
          </div>
        )}
      </div>
    </div>
  );
}
