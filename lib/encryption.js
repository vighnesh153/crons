require("dotenv").config();

const crypto = require('crypto');

const generateAndUploadKey = require('./generateKeyAndSetAsGithubSecret');

const IV_LENGTH = 16;   // For AES, this is always 16

async function encrypt(text) {
  const ENCRYPTION_KEY = await generateAndUploadKey();

  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  // This is set in the Github Secrets
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;  // Must be 256 bits (32 characters)

  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

module.exports = { decrypt, encrypt };
