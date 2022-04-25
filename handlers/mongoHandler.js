const { MongoClient, ServerApiVersion } = require('mongodb');

// Environment file used to host API keys
require('dotenv');
require('dotenv').config();

// Setting up connection config for MongoDB
const uri = process.env.MONGO_URL;
const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const getCollection = async () => {
  try {
    await mongoClient.connect();
    // TODO: add to .env
    const database = mongoClient.db('mv3');
    return database.collection('mv3-sales');
  } catch (e) {
    console.error(e);
    return 'An error occurred.';
  }
};

const checkDataDuplicate = async (from, to, timestamp, txHash) => {
  try {
    const collection = await getCollection();
    // Checking if the there was a sync error and the same transaction already exists in the databse
    const previousRecords = await collection.findOne({
      from,
      to,
      timestamp,
      txHash,
    });
    if (previousRecords === undefined) {
      return false;
    }
    console.log({ message: 'Transaction is a duplicate' });
    return true;
  } catch (e) {
    console.error(e);
    return 'An error occurred.';
  }
};

const insertRecordToMongo = async (message) => {
  try {
    const collection = await getCollection();
    return collection.insertOne(message);
  } catch (e) {
    console.error(e);
    return 'An error occurred.';
  }
};

module.exports = {
  checkDataDuplicate,
  insertRecordToMongo,
};
