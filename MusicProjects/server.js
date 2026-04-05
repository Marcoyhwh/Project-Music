const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  ensureProjectDirs,
  getInputFilePath,
  getOutputFilePath,
  buildConvertedFileName,
  sanitizeFileName,
  buildUniqueFilePath,
} = require("./src/utils/fileUtils");
const { convertAudio } = require("./src/services/audioConversion");
const { analyzeSpectrogram } = require("./src/services/spectrogramAnalysis");
const { downloadYoutubeMedia } = require("./src/services/youtubeDownload");
const { INPUT_DIR, OUTPUT_DIR, DOWNLOADS_DIR } = require("./src/config/paths");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// static files
app.use("/files/input", express.static(INPUT_DIR));
app.use("/files/output", express.static(OUTPUT_DIR));
app.use("/files/downloads", express.static(DOWNLOADS_DIR));

// multer upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, INPUT_DIR),
  filename: (req, file, cb) => {
    const safe = sanitizeFileName(file.originalname);
    cb(null, buildUniqueFilePath(INPUT_DIR, safe).split(path.sep).pop());
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => cb(null, true),
});

// ---- helpers ----
function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => !f.startsWith("."));
}

// ---- list files ----
app.get("/api/files", (req, res) => {
  const { type } = req.query; // input | output | downloads
  if (type === "input") return res.json(listFiles(INPUT_DIR));
  if (type === "output") return res.json(listFiles(OUTPUT_DIR));
  if (type === "downloads") return res.json(listFiles(DOWNLOADS_DIR));
  res.status(400).json({ error: 'Query param "type" required: input, output, or downloads' });
});

// ---- upload ----
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });
  res.json({ fileName: req.file.filename });
});

// ---- convert ----
app.post("/api/convert", async (req, res) => {
  const { fileName, targetFormat } = req.body;
  if (!fileName || !targetFormat) {
    return res.status(400).json({ error: "fileName e targetFormat sao obrigatorios" });
  }
  try {
    const outputFilePath = await convertAudio(fileName, targetFormat);
    res.json({
      fileName: path.basename(outputFilePath),
      message: "Conversao concluida com sucesso.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- analyze ----
app.post("/api/analyze", async (req, res) => {
  const { fileName } = req.body;
  if (!fileName) return res.status(400).json({ error: "fileName e obrigatorio" });
  try {
    const result = await analyzeSpectrogram(fileName);
    res.json({
      maxFrequencyHz: parseFloat(result.maxFrequencyHz.toFixed(2)),
      quality: result.quality,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- youtube download ----
app.post("/api/youtube", async (req, res) => {
  const { url, format } = req.body;
  if (!url || !format) return res.status(400).json({ error: "url e format sao obrigatorios" });
  try {
    const result = await downloadYoutubeMedia(url, format);
    res.json({
      title: result.title,
      fileName: result.fileName,
      format: result.format,
      message: "Download concluido com sucesso.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- download file ----
app.get("/api/download-file", (req, res) => {
  const { type, fileName } = req.query;
  if (!type || !fileName) return res.status(400).json({ error: "type e fileName sao obrigatorios" });
  const dir = type === "output" ? OUTPUT_DIR : type === "downloads" ? DOWNLOADS_DIR : INPUT_DIR;
  const filePath = path.join(dir, fileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Arquivo nao encontrado" });
  if (type === "input") return res.redirect(`/files/input/${encodeURIComponent(fileName)}`);
  if (type === "output") return res.redirect(`/files/output/${encodeURIComponent(fileName)}`);
  return res.redirect(`/files/downloads/${encodeURIComponent(fileName)}`);
});

// delete file
app.delete("/api/files/:type/:fileName", (req, res) => {
  const { type, fileName } = req.params;
  const dir = type === "output" ? OUTPUT_DIR : type === "downloads" ? DOWNLOADS_DIR : INPUT_DIR;
  const filePath = path.join(dir, fileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Arquivo nao encontrado" });
  fs.unlinkSync(filePath);
  res.json({ message: "Arquivo removido com sucesso." });
});

ensureProjectDirs();
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
