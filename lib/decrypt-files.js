const { decrypt } = require("./encryption");

const fs = require("fs");

const encryptedSecrets = fs.readFileSync("es.txt").toString();
const encryptedConstants = fs.readFileSync("ec.txt").toString();

fs.writeFileSync("secrets.json", decrypt(encryptedSecrets));
fs.writeFileSync("constants.json", decrypt(encryptedConstants));
