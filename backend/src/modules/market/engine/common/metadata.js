const path = require("path");

function createMetadata(filePath) {
  return {
    fileName: filePath ? path.basename(filePath) : null,
    fileSize: null,
    encoding: "utf-8",
    delimiter: null,
    headers: [],
    rowsCount: 0,
  };
}

module.exports = {
  createMetadata,
};
