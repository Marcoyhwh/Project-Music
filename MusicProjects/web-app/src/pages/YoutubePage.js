import React, { useState } from "react";
import { API } from "../App";

function YoutubePage() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("mp3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), format }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro no download.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Erro de conexao com o servidor.");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Download do YouTube</h1>
        <p className="page-subtitle">
          Baixe videos ou a partir de URLs do YouTube em varios formatos
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">URL do video</h3>
        <div className="form-group">
          <label className="form-label">Cole o link aqui</label>
          <input
            type="text"
            className="form-input"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setResult(null);
              setError(null);
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Formato</label>
          <select
            className="form-input form-select"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="mp3">.mp3</option>
            <option value="mp4">.mp4</option>
            <option value="wav">.wav</option>
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleDownload}
          disabled={!url.trim() || loading}
        >
          {loading ? <span className="spinner" /> : "Baixar"}
        </button>

        {error && (
          <div className="alert alert-error">
            <span>!</span> {error}
          </div>
        )}

        {result && (
          <>
            <div className="result-card">
              <div className="result-row">
                <span className="result-label">Titulo</span>
                <span className="result-value">{result.title}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Formato</span>
                <span className="result-value">.{result.format}</span>
              </div>
            </div>
            <div className="alert alert-success">
              <a
                href={`${API}/api/download-file?type=downloads&fileName=${encodeURIComponent(
                  result.fileName
                )}`}
                download
                className="btn btn-download"
              >
                Baixar {result.fileName}
              </a>
              <span>{result.message}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default YoutubePage;
