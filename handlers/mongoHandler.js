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
	// Checking if the there was a sync error and the same transaction already exists in the databse
	try {
		const previousRecords = await mongoClient.collection.findOne({
			from,
			to,
			timestamp,
			txHash,
		});
		if (!previousRecords) {
			return false;
		}
		console.log({ message: "Transaction is a duplicate" });
		return true;
	} catch (e) {
		console.error(e);
	}
};

const insertRecordToMongo = async (message) => {
	if (
		await checkDataDuplicate(
			message.from,
			message.to,
			message.timestamp,
			message.txHash,
		)
	)
		return;
	try {
		return mongoClient.collection.insertOne(message);
	} catch (e) {
		console.error(e);
	}
};

module.exports = {
	insertRecordToMongo,
};
