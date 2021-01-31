const fs = require('fs');
const {execSync} = require("child_process");

const mime = require('mime-types')
const {google} = require('googleapis');

const constants = require("../../constants.json")

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

// Create Mongo Dump and Upload to Google Drive
(() => {

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

// Remove very-old backups
(async () => {
  function getExpiryDays(parents) {
    for (const fileMeta of (constants.files || [])) {
      if (parents.includes(fileMeta.parentDirId)) {
        return fileMeta.maxDays;
      }
    }
    return -1;
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function checkIfExpired(fileName, expiryDays) {
    const sections = fileName.toString().split('_');
    const month = parseInt(sections[0]);  // 1 to 12
    const day = parseInt(sections[1]);
    const year = parseInt(sections[2]);

    // in JS, valid months are 0 to 11
    const dateCreated = new Date(year, month - 1, day);
    const expiresOn = addDays(dateCreated, expiryDays);

    return expiresOn < new Date();
  }

  try {
    const res = await drive.files.list({
      corpora: 'user',
      fields: [
        'files(id,kind,name,parents,mimeType)'
      ],
    });
    for (const file of res.data.files) {
      const parents = file.parents || [];
      const expiryDays = getExpiryDays(parents);
      if (expiryDays === -1) {
        continue;
      }
      const hasExpired = checkIfExpired(file.name, expiryDays);
      if (hasExpired) {
        await drive.files.delete({
          fileId: file.id
        });
        console.log('Deleted file:', file.id, file.name);
      }
    }
  } catch (e) {
    console.error(e);
  }
})();

