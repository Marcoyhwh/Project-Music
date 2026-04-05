import React, { useState, useRef } from "react";
import { API } from "../App";

function getQualityClass(quality) {
  const q = quality.toLowerCase();
  if (q.includes("maxima")) return "quality-maxima";
  if (q.includes("alta")) return "quality-alta";
  if (q.includes("media")) return "quality-media";
  return "quality-pessima";
}

function getFrequencyPercent(freq) {
  // 20kHz is the theoretical max for human hearing
  return Math.min((Math.max(freq, 0) / 20000) * 100, 100);
}

function AnalyzePage() {
  const [inputFiles, setInputFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const fetchInputFiles = async () => {
    try {
      const res = await fetch(`${API}/api/files?type=input`);
      const files = await res.json();
      setInputFiles(files);
    } catch (err) {
      // ignore
    }
  };

  React.useEffect(() => {
    fetchInputFiles();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API}/api/upload`, { method: "POST", body: formData });
      const data = await res.json();
      setSelectedFile(data.fileName);
      setInputFiles((prev) => [...prev, data.fileName]);
      setResult(null);
      setError(null);
    } catch (err) {
      setError("Falha ao enviar arquivo.");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: selectedFile }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro na analise.");
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
        <h1 className="page-title">Analise de Espectrograma</h1>
        <p className="page-subtitle">
          Avalie a qualidade do audio com base na frequencia maxima detectada
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">Selecionar arquivo</h3>

        {inputFiles.length > 0 && (
          <div className="form-group">
            <label className="form-label">Arquivos disponiveis</label>
            <select
              className="form-input form-select"
              value={selectedFile}
              onChange={(e) => {
                setSelectedFile(e.target.value);
                setResult(null);
                setError(null);
              }}
            >
              <option value="">Selecione...</option>
              {inputFiles.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Ou envie um novo arquivo</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Escolher arquivo
          </button>
        </div>

        {selectedFile && (
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Analisar"}
          </button>
        )}
      </div>

      {error && (
        <div className="card">
          <div className="alert alert-error">
            <span>!</span> {error}
          </div>
        </div>
      )}

      {result && (
        <div className="card">
          <h3 className="card-title">Resultado da Analise</h3>
          <div className="result-card">
            <div className="result-row">
              <span className="result-label">Arquivo</span>
              <span className="result-value">{selectedFile}</span>
            </div>
            <div className="result-row">
              <span className="result-label">Frequencia maxima</span>
              <span className="result-value">
                {result.maxFrequencyHz.toFixed(2)} Hz
              </span>
            </div>
            <div className="result-row">
              <span className="result-label">Qualidade</span>
              <span className={`quality-badge ${getQualityClass(result.quality)}`}>
                {result.quality}
              </span>
            </div>
          </div>

          <div className="frequency-bar-container">
            <div className="frequency-bar-label">
              <span>0 Hz</span>
              <span>20 kHz</span>
            </div>
            <div className="frequency-bar-track">
              <div
                className="frequency-bar-fill"
                style={{
                  width: `${getFrequencyPercent(result.maxFrequencyHz)}%`,
                  backgroundColor:
                    getFrequencyPercent(result.maxFrequencyHz) > 80
                      ? "var(--success)"
                      : getFrequencyPercent(result.maxFrequencyHz) > 60
                      ? "var(--accent)"
                      : getFrequencyPercent(result.maxFrequencyHz) > 40
                      ? "var(--warning)"
                      : "var(--error)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AnalyzePage;
