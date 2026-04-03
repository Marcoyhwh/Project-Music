const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const {
  assertInputFileExists,
  buildConvertedFileName,
  getOutputFilePath,
} = require("../utils/fileUtils");

function convertAudio(fileName, targetFormat) {
  const normalizedFormat = targetFormat.trim().toLowerCase();

  if (!normalizedFormat) {
    throw new Error("Informe um formato de saida valido.");
  }

  const inputFilePath = assertInputFileExists(fileName);
  const outputFileName = buildConvertedFileName(fileName, normalizedFormat);
  const outputFilePath = getOutputFilePath(outputFileName);

  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegPath, [
      "-y",
      "-i",
      inputFilePath,
      outputFilePath,
    ]);

    const stderrChunks = [];

    ffmpegProcess.stderr.on("data", (chunk) => stderrChunks.push(chunk));

    ffmpegProcess.on("error", (error) => {
      reject(new Error(`Falha ao iniciar o ffmpeg: ${error.message}`));
    });

    ffmpegProcess.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Falha na conversao do arquivo: ${Buffer.concat(stderrChunks).toString()}`
          )
        );
        return;
      }

      resolve(outputFilePath);
    });
  });
}

module.exports = {
  convertAudio,
};
