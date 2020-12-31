const crypto = require('crypto');

const sodium = require('tweetsodium');
const { Octokit } = require("@octokit/core");

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const octokit = new Octokit({ auth: process.env.GH_PERSONAL_ACCESS_TOKEN });

module.exports = async () => {
  const encryptionKey = crypto.randomBytes(16).toString('hex');
  const publicKey = await octokit
    .request('GET /repos/vighnesh153/crons/actions/secrets/public-key')
    .data
    .key;

  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(encryptionKey);
  const keyBytes = Buffer.from(publicKey, 'base64');

  // Encrypt using LibSodium.
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);

  // Base64 the encrypted secret
  const encryptedEncryptionKey = Buffer.from(encryptedBytes).toString('base64');

  await octokit.request('PUT /repos/vighnesh153/crons/actions/secrets/ENCRYPTION_KEY', {
    owner: 'vighnesh153',
    repo: 'crons',
    secret_name: 'ENCRYPTION_KEY',
    encrypted_value: encryptedEncryptionKey,
  });

  return encryptionKey;
};
