import React, { useState } from "react";
import * as XLSX from "xlsx";
import API from "../api";

export default function UploadMapGenerate() {
  const [rows, setRows] = useState([]);
  const [filenameToken, setFilenameToken] = useState(null);
  const [message, setMessage] = useState("");

  /* --------------------------------
     EXCEL DATE HANDLING (Preview only)
  --------------------------------- */
  function excelToJSDate(serial) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + serial * 86400000);
  }

  function normalizeValue(value) {
    if (typeof value === "number") {
      return excelToJSDate(value).toISOString().split("T")[0];
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toISOString().split("T")[0];
  }

  /* --------------------------------
     HANDLE FILE UPLOAD
  --------------------------------- */
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      /* ---- Local preview ---- */
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      let js = XLSX.utils.sheet_to_json(ws, { defval: "" });

      js = js
        .map((row) => ({
          "Student name": row["Student name"],
          "internship domain": row["internship domain"],
          "start date": normalizeValue(row["start date"]),
          "end date": normalizeValue(row["end date"]),
          email: row["email"],
        }))
        .filter((r) =>
          Object.values(r).some((v) => String(v).trim() !== "")
        );

      setRows(js);

      /* ---- Upload to backend ---- */
      const form = new FormData();
      form.append("file", file);

      const res = await API.post("/certs/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFilenameToken(res.data.filename);
      setMessage("File uploaded successfully. Ready to generate.");
    } catch (err) {
      console.error(err);
      setMessage("Upload or preview failed");
    }
  };

  /* --------------------------------
     GENERATE CERTIFICATES (AUTO)
  --------------------------------- */
  const generate = async () => {
    if (!filenameToken) {
      setMessage("Upload file first");
      return;
    }

    try {
      await API.post("/certs/generate", {
        filename: filenameToken,
        mapping: {
          studentName: "Student name",
          courseName: "internship domain",
          issueDate: "end date",
          email: "email",
        },
      });

      setMessage("Certificates generated successfully");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Generation failed");
    }
  };

  return (
    <div className="container">
      <div className="auth-card1">
        <h2>Upload Excel</h2>

        <input type="file" accept=".xlsx,.xls" onChange={handleFile} />

        {message && <span className="success-pill">{message}</span>}

        {rows.length > 0 && (
          <>
            <h4>Preview</h4>
            <div className="table-scroll">
              <table className="table preview-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Internship Domain</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{r["Student name"]}</td>
                      <td>{r["internship domain"]}</td>
                      <td>{r["start date"]}</td>
                      <td>{r["end date"]}</td>
                      <td>{r.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={generate}>
              Generate Certificates
            </button>
          </>
        )}
      </div>
    </div>
  );
}
