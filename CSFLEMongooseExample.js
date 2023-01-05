const { ClientEncryption } = require('mongodb-client-encryption');
const base64 = require('uuid-base64');
const mongoose = require('mongoose');

// DONOT USE IN PRODUCTION
function getEncryptionKey() {
  const arr = [];
  for (let i = 0; i < 96; ++i) {
    arr.push(i);
  }
  const key = Buffer.from(arr);

  return key;
}

const key = getEncryptionKey();
const keyVaultNamespace = 'client.encryption';
const kmsProviders = { local: { key } };

async function main() {
  await mongoose.connect('ATLAS_URL', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Configure auto encryption
    autoEncryption: {
      keyVaultNamespace, 
      kmsProviders
    }
  });
  
  const encryption = new ClientEncryption(mongoose.connection.client, {
      keyVaultNamespace,
      kmsProviders,
  });
  
  const __key__ = await encryption.createDataKey('local');
  await mongoose.connection.dropCollection('testColl').catch(() => {});
  await mongoose.connection.createCollection('testColl', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        properties: {
          name: {
            encrypt: {
              bsonType: 'string',
              keyId: [__key__],
              algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic' }
          }
        }
      }
    }
  });
  
  const Model = mongoose.model('Karan', mongoose.Schema({ name: String }));
  await Model.create({ name: 'Hello World!' });
}

main().catch(console.log)
