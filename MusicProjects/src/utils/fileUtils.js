const fs = require("fs");
const path = require("path");
const { DOWNLOADS_DIR, INPUT_DIR, OUTPUT_DIR } = require("../config/paths");

function ensureProjectDirs() {
  fs.mkdirSync(INPUT_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

function getInputFilePath(fileName) {
  return path.join(INPUT_DIR, fileName);
}

function getOutputFilePath(fileName) {
  return path.join(OUTPUT_DIR, fileName);
}

function assertInputFileExists(fileName) {
  const filePath = getInputFilePath(fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Arquivo nao encontrado em src/inputMusics: ${fileName}`
    );
  }

  return filePath;
}

function buildConvertedFileName(originalFileName, targetFormat) {
  const parsedFile = path.parse(originalFileName);
  return `${parsedFile.name}.${targetFormat.toLowerCase()}`;
}

function sanitizeFileName(fileName) {
  const sanitized = fileName
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "");

  return sanitized || "download";
}

function buildUniqueFilePath(directoryPath, fileName) {
  const parsedFile = path.parse(fileName);
  let candidateName = fileName;
  let candidatePath = path.join(directoryPath, candidateName);
  let counter = 1;

  while (fs.existsSync(candidatePath)) {
    candidateName = `${parsedFile.name} (${counter})${parsedFile.ext}`;
    candidatePath = path.join(directoryPath, candidateName);
    counter += 1;
  }

  return candidatePath;
}

module.exports = {
  ensureProjectDirs,
  getInputFilePath,
  getOutputFilePath,
  assertInputFileExists,
  buildConvertedFileName,
  sanitizeFileName,
  buildUniqueFilePath,
};
