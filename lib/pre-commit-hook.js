const fs = require("fs");

const { encrypt } = require("./encryption");

const generateAndUploadKey = require('./generateKeyAndSetAsGithubSecret');

const secretsJson = fs.readFileSync("secrets.json");
const constantsJson = fs.readFileSync("constants.json");


(async () => {
  const ENCRYPTION_KEY = await generateAndUploadKey();

  const encryptedSecrets = await encrypt(secretsJson, ENCRYPTION_KEY);
  const encryptedConstants = await encrypt(constantsJson, ENCRYPTION_KEY);

  fs.writeFileSync("es.txt", encryptedSecrets);
  fs.writeFileSync("ec.txt", encryptedConstants);
})();
