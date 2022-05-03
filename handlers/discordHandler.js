const { discordSetup, createMessage } = require("../utils/discord");

const sendDiscordMessage = async (message) => {
	try {
		const channel = await discordSetup(
			process.env.DISCORD_BOT_TOKEN,
			process.env.DISCORD_CHANNEL_ID,
		);

		return await channel.send({
			embeds: [
				await createMessage(
					message.name,
					message.image,
					message.value,
					message.to,
					message.from,
					message.timestamp,
					message.tokenId,
				),
			],
		});
	} catch (e) {
		console.error(e);
	}
};

module.exports = {
	sendDiscordMessage,
};
