const { MongoClient, ServerApiVersion } = require("mongodb");

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
		const database = mongoClient.db(process.env.DB_NAME);
		mongoClient.collection = database.collection(
			process.env.COLLECTION_NAME,
		);
	} catch (e) {
		console.error(e);
	} finally {
		await mongoClient.close(); //ensure the connection is closed
	}
};

getCollection();

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
