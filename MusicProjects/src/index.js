const path = require("path");
const { showMenu } = require("./menu");
const { DOWNLOADS_DIR, OUTPUT_DIR } = require("./config/paths");
const { convertAudio } = require("./services/audioConversion");
const { analyzeSpectrogram } = require("./services/spectrogramAnalysis");
const { downloadYoutubeMedia } = require("./services/youtubeDownload");
const { ensureProjectDirs } = require("./utils/fileUtils");
const { createPrompt } = require("./utils/prompt");

async function handleConversion(prompt) {
  const fileName = (await prompt.question(
    "Digite o nome do arquivo de entrada (com extensao): "
  )).trim();
  const targetFormat = (await prompt.question(
    "Digite o formato de saida desejado (ex: mp3, wav): "
  )).trim();

  const outputFilePath = await convertAudio(fileName, targetFormat);

  console.log("");
  console.log("Conversao concluida com sucesso.");
  console.log(
    `Arquivo salvo em: ${path.relative(process.cwd(), outputFilePath)}`
  );
}

async function handleAnalysis(prompt) {
  const fileName = (await prompt.question(
    "Digite o nome do arquivo para analise (com extensao): "
  )).trim();

  const result = await analyzeSpectrogram(fileName);

  console.log("");
  console.log(`Frequencia maxima detectada: ${result.maxFrequencyHz.toFixed(2)} Hz`);
  console.log(`Resultado da analise: ${result.quality}`);
}

async function handleYoutubeDownload(prompt) {
  const videoUrl = (await prompt.question(
    "Cole o link do video aqui: "
  )).trim();
  const targetFormat = (await prompt.question(
    "Em qual formato voce quer baixar? (mp3, mp4 ou wav): "
  )).trim();

  console.log("");
  console.log("Preparando download, isso pode levar alguns instantes...");

  const result = await downloadYoutubeMedia(videoUrl, targetFormat);

  console.log("");
  console.log("Download concluido com sucesso.");
  console.log(`Titulo do video: ${result.title}`);
  console.log(
    `Arquivo salvo em: ${path.relative(process.cwd(), result.outputFilePath)}`
  );
}

async function main() {
  ensureProjectDirs();
  const prompt = createPrompt();

  try {
    console.log("");
    console.log("Pasta de entrada: src/inputMusics");
    console.log(`Pasta de saida: ${path.relative(process.cwd(), OUTPUT_DIR)}`);
    console.log(
      `Pasta de downloads: ${path.relative(process.cwd(), DOWNLOADS_DIR)}`
    );
    console.log("");

    const option = (await showMenu(prompt)).trim();
    console.log("");

    if (option === "1") {
      await handleConversion(prompt);
      return;
    }

    if (option === "2") {
      await handleAnalysis(prompt);
      return;
    }

    if (option === "3") {
      await handleYoutubeDownload(prompt);
      return;
    }

    console.log("Opcao invalida. Execute novamente e escolha 1, 2 ou 3.");
  } catch (error) {
    console.error(`Erro: ${error.message}`);
  } finally {
    prompt.close();
  }
}

main();
