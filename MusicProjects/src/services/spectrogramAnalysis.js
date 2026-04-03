const { spawn } = require("child_process");
const { fft, util: fftUtil } = require("fft-js");
const ffmpegPath = require("ffmpeg-static");
const { assertInputFileExists } = require("../utils/fileUtils");

const SAMPLE_RATE = 44100;
const WINDOW_SIZE = 4096;
const HOP_SIZE = 4096;
const FRAME_SIGNIFICANCE_RATIO = 0.01;
const MIN_HIT_RATIO = 0.02;
const MIN_AVERAGE_NORMALIZED_MAGNITUDE = 0.003;
const SMOOTHING_RADIUS = 2;

function decodeToPCM(filePath) {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpegPath, [
      "-i",
      filePath,
      "-vn",
      "-ac",
      "1",
      "-ar",
      String(SAMPLE_RATE),
      "-f",
      "s16le",
      "-",
    ]);

    const stdoutChunks = [];
    const stderrChunks = [];

    ffmpegProcess.stdout.on("data", (chunk) => stdoutChunks.push(chunk));
    ffmpegProcess.stderr.on("data", (chunk) => stderrChunks.push(chunk));

    ffmpegProcess.on("error", (error) => {
      reject(new Error(`Falha ao iniciar o ffmpeg: ${error.message}`));
    });

    ffmpegProcess.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Falha ao decodificar audio: ${Buffer.concat(stderrChunks).toString()}`
          )
        );
        return;
      }

      resolve(Buffer.concat(stdoutChunks));
    });
  });
}

function pcmBufferToSamples(buffer) {
  const sampleCount = Math.floor(buffer.length / 2);
  const samples = new Float32Array(sampleCount);

  for (let index = 0; index < sampleCount; index += 1) {
    samples[index] = buffer.readInt16LE(index * 2) / 32768;
  }

  return samples;
}

function buildHannWindow(size) {
  const window = new Float32Array(size);

  for (let index = 0; index < size; index += 1) {
    window[index] = 0.5 * (1 - Math.cos((2 * Math.PI * index) / (size - 1)));
  }

  return window;
}

function smoothValues(values, radius) {
  const smoothed = new Float64Array(values.length);

  for (let index = 0; index < values.length; index += 1) {
    let sum = 0;
    let count = 0;

    for (
      let neighborIndex = Math.max(0, index - radius);
      neighborIndex <= Math.min(values.length - 1, index + radius);
      neighborIndex += 1
    ) {
      sum += values[neighborIndex];
      count += 1;
    }

    smoothed[index] = count > 0 ? sum / count : 0;
  }

  return smoothed;
}

function detectMaximumFrequency(samples) {
  if (samples.length < WINDOW_SIZE) {
    throw new Error(
      "O arquivo e muito curto para analise. Use um audio com mais duracao."
    );
  }

  const hannWindow = buildHannWindow(WINDOW_SIZE);
  const binCount = WINDOW_SIZE / 2;
  const frame = new Array(WINDOW_SIZE);
  const hitCounts = new Uint32Array(binCount);
  const accumulatedNormalizedMagnitudes = new Float64Array(binCount);
  let frameCount = 0;

  for (
    let startIndex = 0;
    startIndex + WINDOW_SIZE <= samples.length;
    startIndex += HOP_SIZE
  ) {
    for (let sampleIndex = 0; sampleIndex < WINDOW_SIZE; sampleIndex += 1) {
      frame[sampleIndex] =
        samples[startIndex + sampleIndex] * hannWindow[sampleIndex];
    }

    const phasors = fft(frame);
    const magnitudes = fftUtil.fftMag(phasors).slice(0, binCount);
    const framePeakMagnitude = Math.max(...magnitudes);

    if (framePeakMagnitude === 0) {
      continue;
    }

    const frameThreshold = framePeakMagnitude * FRAME_SIGNIFICANCE_RATIO;

    for (let bin = 0; bin < magnitudes.length; bin += 1) {
      const normalizedMagnitude = magnitudes[bin] / framePeakMagnitude;

      accumulatedNormalizedMagnitudes[bin] += normalizedMagnitude;

      if (magnitudes[bin] >= frameThreshold) {
        hitCounts[bin] += 1;
      }
    }

    frameCount += 1;
  }

  if (frameCount === 0) {
    throw new Error("Nao foi possivel gerar janelas para analise.");
  }

  const hitRatios = Float64Array.from(hitCounts, (value) => value / frameCount);
  const averageNormalizedMagnitudes = Float64Array.from(
    accumulatedNormalizedMagnitudes,
    (value) => value / frameCount
  );
  const smoothedHitRatios = smoothValues(hitRatios, SMOOTHING_RADIUS);
  const smoothedAverageMagnitudes = smoothValues(
    averageNormalizedMagnitudes,
    SMOOTHING_RADIUS
  );

  for (let bin = binCount - 1; bin >= 0; bin -= 1) {
    if (
      smoothedHitRatios[bin] >= MIN_HIT_RATIO &&
      smoothedAverageMagnitudes[bin] >=
        MIN_AVERAGE_NORMALIZED_MAGNITUDE
    ) {
      return (bin * SAMPLE_RATE) / WINDOW_SIZE;
    }
  }

  return 0;
}

function classifyAudioQuality(maxFrequencyHz) {
  const maxFrequencyKHz = maxFrequencyHz / 1000;

  if (maxFrequencyKHz <= 12) {
    return "Qualidade pessima";
  }

  if (maxFrequencyKHz <= 15) {
    return "Qualidade media";
  }

  if (maxFrequencyKHz <= 18) {
    return "Qualidade alta";
  }

  if (maxFrequencyKHz < 20) {
    return "Qualidade alta";
  }

  return "Qualidade maxima";
}

async function analyzeSpectrogram(fileName) {
  const inputFilePath = assertInputFileExists(fileName);
  const pcmBuffer = await decodeToPCM(inputFilePath);
  const samples = pcmBufferToSamples(pcmBuffer);
  const maxFrequencyHz = detectMaximumFrequency(samples);
  const quality = classifyAudioQuality(maxFrequencyHz);

  return {
    quality,
    maxFrequencyHz,
  };
}

module.exports = {
  analyzeSpectrogram,
  classifyAudioQuality,
};
