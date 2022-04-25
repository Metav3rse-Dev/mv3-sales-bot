const { format } = require('date-fns');
const { Intents } = require('discord.js');
const Discord = require('discord.js');
const { getEthToUSDPrice } = require('./ethPrice');

const discordSetup = (discordBotToken, discordChannelId) => {
  const discordBot = new Discord.Client({
    intents: [Intents.FLAGS.GUILD_MESSAGES],
  });
  return new Promise((resolve) => {
    discordBot.login(discordBotToken);
    discordBot.on('ready', async () => {
      const channel = await discordBot.channels.fetch(discordChannelId);
      resolve(channel);
    });
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
) => new Discord.MessageEmbed()
  .setColor('#66ff82')
  .setTitle(`${name} sold!`)
  .addFields(
    { name: 'Name', value: `${name}` },
    { name: 'Amount (ETH)', value: `${value} ETH` },
    {
      name: 'Amount (USD)',
      value: `${parseFloat(
        parseFloat(value) * parseFloat(await getEthToUSDPrice()),
      ).toFixed(2)} USD`,
    },
    { name: 'Buyer', value: buyer },
    { name: 'Seller', value: seller },
    {
      name: 'Block Time',
      value: format(new Date(parseInt(timestamp, 10) * 1000), 'MMM do y h:mm a'),
    },
  )
  .setURL(
    `https://opensea.io/assets/${process.env.CONTRACT_ADDRESS}/${tokenId}`,
  )
  .setImage(image);

module.exports = {
  createMessage,
  discordSetup,
};
