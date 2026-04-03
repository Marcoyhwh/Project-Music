async function showMenu(prompt) {
  console.log("Digite o numero correspondente a tarefa a ser executada:");
  console.log(
    "1 - Conversao de arquivo de audio para outro formato (ex: mp4 -> mp3, mp3 -> wav, etc.)"
  );
  console.log(
    "2 - Analise do espectrograma do arquivo (avaliar qualidade da musica com base na frequencia maxima detectada)"
  );
  console.log(
    "3 - Download de video do YouTube em mp3, mp4 ou wav"
  );

  return prompt.question("Opcao escolhida: ");
}

module.exports = {
  showMenu,
};
