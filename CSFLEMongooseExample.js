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
  await mongoose
    .connect(
      'mongodb+srv://testproduser:vJcgAmw1HD5KnNyh@employeedomaincluster.2l9uo.mongodb.net/employeeDomain?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Configure auto encryption
        autoEncryption: {
          keyVaultNamespace,
          kmsProviders,
        },
      }
    )
    .then(
      () => {
        console.log(
          `connected to MongoDB ${mongoose.connection.db.databaseName}`
        );
      },
      (err) => {
        console.error({ message: err.message, metaData: err.stack });
      }
    );

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
              algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
            },
          },
        },
      },
    },
  });

  const Model = mongoose.model(
    'SampleModel',
    mongoose.Schema({ name: String })
  );
  await Model.create({ name: 'Hello World!' });
}

main().catch(console.log);
