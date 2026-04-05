import React, { useState, useRef } from "react";
import { API } from "../App";

const SUPPORTED_FORMATS = ["mp3", "wav", "ogg", "flac", "aac", "mp4", "m4a"];

function ConvertPage() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState("mp3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  const handleFileSelect = (file) => {
    setUploadedFile(file.name);
    setResult(null);
    setError(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (dragRef.current) dragRef.current.classList.remove("drag");
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
    uploadFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (dragRef.current) dragRef.current.classList.add("drag");
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    if (dragRef.current) dragRef.current.classList.remove("drag");
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await fetch(`${API}/api/upload`, { method: "POST", body: formData });
    } catch (err) {
      setError("Falha ao enviar arquivo.");
    }
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
      await uploadFile(file);
    }
  };

  const handleConvert = async () => {
    if (!uploadedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: uploadedFile, targetFormat }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro na conversao.");
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
        <h1 className="page-title">Conversor de Audio</h1>
        <p className="page-subtitle">Converta arquivos de audio para diferentes formatos</p>
      </div>

      <div className="card">
        <h3 className="card-title">Arquivo de entrada</h3>
        <div
          className="upload-zone"
          ref={dragRef}
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <div className="upload-icon">⇅</div>
          <strong>Arraste um arquivo aqui ou clique para selecionar</strong>
          <p>Qual formato de audio suportado pelo ffmpeg</p>
          {uploadedFile && <div className="upload-filename">{uploadedFile}</div>}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileInputChange}
        />
      </div>

      <div className="card">
        <h3 className="card-title">Formato de saida</h3>
        <div className="form-group">
          <label className="form-label">Converter para</label>
          <select
            className="form-input form-select"
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
          >
            {SUPPORTED_FORMATS.map((fmt) => (
              <option key={fmt} value={fmt}>
                .{fmt}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleConvert}
          disabled={!uploadedFile || loading}
        >
          {loading ? <span className="spinner" /> : "Converter"}
        </button>

        {error && (
          <div className="alert alert-error">
            <span>!</span> {error}
          </div>
        )}

        {result && (
          <div className="alert alert-success">
            <span className="download-btn">
              <a
                href={`${API}/api/download-file?type=output&fileName=${encodeURIComponent(
                  result.fileName
                )}`}
                download
                className="btn btn-download"
              >
                Baixar {result.fileName}
              </a>
            </span>
            <span>{result.message || "Conversao concluida!"}</span>
          </div>
        )}
      </div>
    </>
  );
}

export default ConvertPage;
