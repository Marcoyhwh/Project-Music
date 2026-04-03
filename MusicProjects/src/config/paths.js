const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const SRC_DIR = path.join(ROOT_DIR, "src");
const INPUT_DIR = path.join(SRC_DIR, "inputMusics");
const OUTPUT_DIR = path.join(SRC_DIR, "outputMusics");
const DOWNLOADS_DIR = path.join(SRC_DIR, "downloads");

module.exports = {
  ROOT_DIR,
  SRC_DIR,
  INPUT_DIR,
  OUTPUT_DIR,
  DOWNLOADS_DIR,
};
