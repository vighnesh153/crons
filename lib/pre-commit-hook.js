const { encrypt } = require("./encryption");

const fs = require("fs");

const secretsJson = fs.readFileSync("secrets.json");
const constantsJson = fs.readFileSync("constants.json");



(async () => {
  const encryptedSecrets = await encrypt(secretsJson);
  const encryptedConstants = await encrypt(constantsJson);

  fs.writeFileSync("es.txt", encryptedSecrets);
  fs.writeFileSync("ec.txt", encryptedConstants);
})();
