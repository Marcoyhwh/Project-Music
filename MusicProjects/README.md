# MusicProjects

Projeto em Node.js para executar tarefas de audio e download pelo terminal.

## Funcionalidades

- Conversao de arquivos de audio para outro formato.
- Analise de espectro com classificacao de qualidade com base na frequencia maxima detectada.
- Download de videos do YouTube em `mp3`, `mp4` ou `wav`.

## Estrutura

```text
MusicProjects/
  src/
    config/
    services/
    utils/
    inputMusics/
    outputMusics/
    downloads/
    index.js
```

## Como usar

1. Instale as dependencias:

```bash
npm install
```

2. Coloque os arquivos de entrada em `src/inputMusics/`.
3. Execute o projeto:

```bash
npm start
```

## Fluxo

- Opcao `1`: converte o arquivo informado e salva o resultado em `src/outputMusics/`.
- Opcao `2`: analisa o arquivo informado e mostra o resultado no terminal.
- Opcao `3`: baixa um video do YouTube e salva o resultado em `src/downloads/`.
