const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

function createPrompt() {
  return readline.createInterface({ input, output });
}

module.exports = {
  createPrompt,
};
