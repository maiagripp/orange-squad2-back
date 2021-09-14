const gc = require("../config/gCloud");
const bucket = gc.bucket("orange_fc");

/**
 *
 * @param {String} fileUrl url of the image that will be deleted
 * @description - This function does the following
 * - It takes the image url as string
 * - Extract the file name and delete it from google cloud
 */

async function deleteFile(fileUrl) {
  try {
    const filename = fileUrl.slice(48);
    await bucket.file(filename).delete();
  } catch (err) {
    console.error(err);
  }
}

module.exports = deleteFile;
