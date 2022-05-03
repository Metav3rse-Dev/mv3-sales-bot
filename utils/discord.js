const { format } = require("date-fns");
const { Client, MessageEmbed, Intents } = require("discord.js");
const { getEthToUSDPrice } = require("./ethPrice");

const discordSetup = (discordBotToken, discordChannelId) => {
	const discordBot = new Client({
		intents: [Intents.FLAGS.GUILD_MESSAGES],
	});
	return new Promise((resolve) => {
		discordBot.on("ready", async () => {
			console.log("Discord Bot connected as " + discordBot.user.tag);
			const channel = await discordBot.channels.fetch(discordChannelId);
			resolve(channel);
		});
		discordBot.login(discordBotToken);
	});
};

const createMessage = async (
	name,
	image,
	value,
	buyer,
	seller,
	timestamp,
	tokenId,
) =>
	new MessageEmbed({
		title: `${name} sold!`,
		color: "#66ff82",
		fields: [
			{ name: "Name", value: `${name}` },
			{ name: "Amount (ETH)", value: `${value} ETH` },
			{
				name: "Amount (USD)",
				value: `${parseFloat(
					parseFloat(value) * parseFloat(await getEthToUSDPrice()),
				).toFixed(2)} USD`,
			},
			{ name: "Buyer", value: buyer },
			{ name: "Seller", value: seller },
			{
				name: "Block Time",
				value: format(
					new Date(parseInt(timestamp, 10) * 1000),
					"MMM do y h:mm a",
				),
			},
		],
		url: `https://opensea.io/assets/${process.env.CONTRACT_ADDRESS}/${tokenId}`,
		image: image,
	});

module.exports = {
	createMessage,
	discordSetup,
};
