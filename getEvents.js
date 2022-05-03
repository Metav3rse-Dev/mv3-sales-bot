const Web3 = require("web3");
const BN = require("bignumber.js");
const { readFile } = require("fs/promises");

// Handler imports
const { insertRecordToMongo } = require("./handlers/mongoHandler");
const { sendDiscordMessage } = require("./handlers/discordHandler");
const { sendTweet } = require("./handlers/twitterHandler");

// Util imports
const { fetchMetadata } = require("./utils/metadata");

const getEvents = async () => {
	// Connection options for the Web3 Event Listener
	const options = {
		// Enable auto reconnection
		reconnect: {
			auto: true,
			delay: 5000, // ms
			maxAttempts: 5000,
			onTimeout: false,
		},
		clientConfig: {
			maxReceivedFrameSize: 1000000000000000000000,
			maxReceivedMessageSize: 1000000000000000000000,
		},
	};

	// Setting Infura as the Web Provider
	const web3 = new Web3(process.env.WEB3_PROVIDER);
	web3.setProvider(
		new Web3.providers.WebsocketProvider(
			process.env.WEB3_SOCKET_PROVIDER,
			options,
		),
	);

	const abi = JSON.parse(await readFile("./utils/contractABI.json"));
	// Initializing the contract with Web3 using ABI for ERC721A
	// Contract address for MV3
	const myContract = await new web3.eth.Contract(
		abi,
		process.env.CONTRACT_ADDRESS,
	);

	// Listening for "Transfer" event
	myContract.events
		.Transfer({
			fromBlock: await web3.eth.getBlockNumber(),
		})
		.on("connected", (subscriptionId) => {
			console.log({ subscriptionId });
		})
		.on("data", async (res) => {
			// Getting the Transaction Hash and Receipt
			await web3.eth.getTransaction(res.transactionHash);
			const txReceipt = await web3.eth.getTransactionReceipt(
				res.transactionHash,
			);
			const typesArray = [
				{ type: "bytes32", name: "buyHash" },
				{ type: "bytes32", name: "sellHash" },
				{ type: "uint256", name: "price" },
			];
			txReceipt?.logs.forEach(async (log) => {
				if (
					!(
						log.topics[0] === process.env.WALLET_ADDRESS &&
						(log.topics[1]?.toLowerCase() ===
							web3.utils
								.padLeft(res.returnValues.from, 64)
								.toLowerCase() ||
							log.topics[2]?.toLowerCase() ===
								web3.utils
									.padLeft(res.returnValues.from, 64)
									.toLowerCase())
					)
				)
					return;

				const decodedParameters = web3.eth.abi.decodeParameters(
					typesArray,
					log.data,
				);
				const v = `${parseInt(decodedParameters.price, 10)}`;
				const value = new BN(web3.utils.fromWei(v));
				if (!value.gt(0)) return;
				// Getting the Block of Transaction
				const block = await web3.eth.getBlock(res.blockNumber);
				// Creating a JSON that will hold all the data
				let message = {
					value: value.toFixed(), // Value of transaction
					to: res.returnValues.to, // NFT Transferred To (Buyer)
					from: res.returnValues.from, // NFT Transferred From (Seller)
					timestamp: block.timestamp, // Timestamp of the transaction (in UNIX)
					tokenId: res.returnValues.tokenId, // Token ID of the NFT transferred/Sold
					txHash: res.transactionHash, // Transaction Hash
				};

				// Checking if the transfer was a mint or a sale
				if (
					!(
						res.returnValues.from !==
							"0x0000000000000000000000000000000000000000" &&
						parseFloat(value.toFixed()) > 0
					)
				)
					return;
				// Consoling the Message Block generate above
				console.log({ message });
				const newRecord = await insertRecordToMongo(message);
				console.log({
					message: `Adding transaction to database with id: ${newRecord.insertedId.toString()}`,
				});
				const uri = await myContract.methods
					.tokenURI(message.tokenId)
					.call();
				const metadata = await fetchMetadata(uri);
				message = {
					...message,
					name: metadata.name,
					image: metadata.image,
				};

				const tweetData = await sendTweet(message);
				console.log({ tweetData });

				const discordMessageData = await sendDiscordMessage(message);
				console.log({ discordMessageData });
			});
		})
		.on("error", (e) => {
			console.error(e);
		});
};

module.exports = { getEvents };
