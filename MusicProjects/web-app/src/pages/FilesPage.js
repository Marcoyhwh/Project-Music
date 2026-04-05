import React, { useState, useEffect, useCallback } from "react";
import { API } from "../App";

function FilesPage() {
  const [activeTab, setActiveTab] = useState("input");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/files?type=${activeTab}`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      // ignore
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (fileName) => {
    try {
      await fetch(`${API}/api/files/${activeTab}/${encodeURIComponent(fileName)}`, {
        method: "DELETE",
      });
      fetchFiles();
    } catch (err) {
      // ignore
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Arquivos</h1>
        <p className="page-subtitle">Gerencie todos os arquivos do projeto</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "input" ? "active" : ""}`}
          onClick={() => setActiveTab("input")}
        >
          Entrada
        </button>
        <button
          className={`tab ${activeTab === "output" ? "active" : ""}`}
          onClick={() => setActiveTab("output")}
        >
          Conversoes
        </button>
        <button
          className={`tab ${activeTab === "downloads" ? "active" : ""}`}
          onClick={() => setActiveTab("downloads")}
        >
          Downloads
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
        </div>
      ) : files.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
            </div>
            <p className="empty-text">
              Nenhum arquivo nesta categoria
            </p>
          </div>
        </div>
      ) : (
        <ul className="file-list">
          {files.map((file) => (
            <li key={file} className="file-item">
              <span className="file-name">
                <span className="file-icon">
                </span>
                {file}
              </span>
              <div className="file-actions">
                <a
                  href={`${API}/api/download-file?type=${activeTab}&fileName=${encodeURIComponent(
                    file
                  )}`}
                  download
                  className="btn btn-download"
                >
                  Baixar
                </a>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(file)}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default FilesPage;
