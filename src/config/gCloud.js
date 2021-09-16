const Cloud = require("@google-cloud/storage");
const path = require("path");

const serviceKey = path.join(__dirname, "googleCloud/keys.json");

const { Storage } = Cloud;
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: "orange_fc",
});

module.exports = storage;
