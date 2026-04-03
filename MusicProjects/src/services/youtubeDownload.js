const fs = require("fs");
const path = require("path");
const youtubedl = require("youtube-dl-exec");
const ffmpegPath = require("ffmpeg-static");
const { DOWNLOADS_DIR } = require("../config/paths");
const {
  buildUniqueFilePath,
  sanitizeFileName,
} = require("../utils/fileUtils");

const SUPPORTED_FORMATS = new Set(["mp3", "mp4", "wav"]);

function normalizeTargetFormat(targetFormat) {
  const normalizedFormat = targetFormat.trim().toLowerCase();

  if (!SUPPORTED_FORMATS.has(normalizedFormat)) {
    throw new Error("Formato invalido. Escolha mp3, mp4 ou wav.");
  }

  return normalizedFormat;
}

function assertValidYoutubeUrl(videoUrl) {
  let parsedUrl;

  try {
    parsedUrl = new URL(videoUrl);
  } catch (error) {
    throw new Error("Link invalido. Informe uma URL valida do YouTube.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const isYoutubeHost =
    hostname === "youtu.be" ||
    hostname === "www.youtu.be" ||
    hostname === "youtube.com" ||
    hostname === "www.youtube.com" ||
    hostname.endsWith(".youtube.com");

  if (!isYoutubeHost) {
    throw new Error("Link invalido. Informe uma URL valida do YouTube.");
  }
}

function createOutputFilePath(videoTitle, extension) {
  const safeTitle = sanitizeFileName(videoTitle);
  return buildUniqueFilePath(DOWNLOADS_DIR, `${safeTitle}.${extension}`);
}

async function fetchVideoInfo(videoUrl) {
  try {
    return await youtubedl(videoUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      noPlaylist: true,
      skipDownload: true,
      ffmpegLocation: ffmpegPath,
    });
  } catch (error) {
    throw new Error(`Falha ao consultar o video no YouTube: ${error.stderr || error.message}`);
  }
}

async function downloadAudio(videoUrl, targetFormat, outputFilePath) {
  try {
    await youtubedl(videoUrl, {
      extractAudio: true,
      audioFormat: targetFormat,
      audioQuality: 0,
      format: "bestaudio/best",
      noWarnings: true,
      noPlaylist: true,
      output: outputFilePath,
      ffmpegLocation: ffmpegPath,
    });
  } catch (error) {
    throw new Error(`Falha ao baixar o audio: ${error.stderr || error.message}`);
  }
}

async function downloadMp4(videoUrl, outputFilePath) {
  try {
    await youtubedl(videoUrl, {
      format: "bv*+ba/b[ext=mp4]/b",
      mergeOutputFormat: "mp4",
      noWarnings: true,
      noPlaylist: true,
      output: outputFilePath,
      ffmpegLocation: ffmpegPath,
    });
  } catch (error) {
    throw new Error(`Falha ao baixar o video: ${error.stderr || error.message}`);
  }
}

async function downloadYoutubeMedia(videoUrl, targetFormat) {
  assertValidYoutubeUrl(videoUrl);

  const normalizedFormat = normalizeTargetFormat(targetFormat);
  const info = await fetchVideoInfo(videoUrl);
  const outputFilePath = createOutputFilePath(
    info.title,
    normalizedFormat
  );

  if (normalizedFormat === "mp4") {
    await downloadMp4(videoUrl, outputFilePath);
  } else {
    await downloadAudio(videoUrl, normalizedFormat, outputFilePath);
  }

  if (!fs.existsSync(outputFilePath)) {
    throw new Error("O download terminou sem gerar o arquivo esperado.");
  }

  return {
    title: info.title,
    outputFilePath,
    format: normalizedFormat,
    fileName: path.basename(outputFilePath),
  };
}

module.exports = {
  downloadYoutubeMedia,
};
