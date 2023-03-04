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
const uriDev = process.env.CONN_STRING;

async function main() {
  await mongoose
    .connect(uriDev, {
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // Configure auto encryption
      autoEncryption: {
        keyVaultNamespace,
        kmsProviders,
        extraOptions: {
          cryptSharedLibPath: "mongo_crypt_v1_ubuntu.so",
          cryptSharedLibRequired: true
        }
      },
    })
    .then(
      () => {
        console.log(
          `connected to MongoDB ${mongoose.connection.db.databaseName}`
        );
      },
      (err) => {
        console.error(err);
      }
    );

  const encryption = new ClientEncryption(mongoose.connection.client, {
    keyVaultNamespace,
    kmsProviders,
  });


  const __key__ = await encryption.createDataKey('local');
  await mongoose.connection.dropCollection('csfles').catch(() => { });
  await mongoose.connection.createCollection('csfles', {
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        properties: {
          name: {
            encrypt: {
              bsonType: 'string',
              keyId: [__key__],
              algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
            },
          },
        },
      },
    },
  });

  const Model = mongoose.model(
    'csfle',
    mongoose.Schema({ name: String })
  );
  await Model.create({ name: "Hello World!" });
}

main().then(console.log).catch(console.error);
