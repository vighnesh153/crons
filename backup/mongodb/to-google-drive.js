const fs = require('fs');
const mime = require('mime-types')

const { google } = require('googleapis');

const drive = google.drive({
  version: 'v3',
  auth: new google.auth.GoogleAuth({
    keyFile: "secrets.json",
    scopes: ['https://www.googleapis.com/auth/drive'],
  }),
});

const getDateForFileName = () => {
  const dateString = new Date().toLocaleString();
  return dateString.replace(/[\/, \:]/g, "_");
};

(() => {
  const {execSync} = require("child_process");

  async function createDumpAndUpload(filePath, parentDirId, MONGO_URL) {
    execSync(`mongodump --uri ${MONGO_URL} --archive=${filePath} --gzip`);

    const res = await drive.files.create({
      requestBody: {
        name: `${getDateForFileName()}.gz`,
        mimeType: mime.lookup(filePath),
        parents: [parentDirId],
      },
      media: {
        mimeType: mime.lookup(filePath),
        body: fs.createReadStream(filePath),
      },
    });

    return res.data.id;
  }

  const constants = require("../../constants.json")
  Promise.all(
    constants
      .files
      .map(({localPath, parentDirId, MONGO_URL}) => {
        return createDumpAndUpload(localPath, parentDirId, MONGO_URL);
      })
  ).then((values) => {
    console.log(values);
  }).catch((err) => {
    console.error(err);
  });
})();

