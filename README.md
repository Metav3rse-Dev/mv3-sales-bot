# NFT Sales Bot by [Metav3rse](https://twitter.com/themetav3rse?s=20&t=C5Hv_osg-0MF0uyPKSCxaA) and [MV3](https://twitter.com/mv3nft) fam

## About

- An opensource bot that fetches NFT sales directly from the Ethereum ledger and broadcasts the information onto Twitter and Discord
- <b> Developed by TroyD41#7095, cole#9349, RT#3588, ghostrunner.eth#0001 </b>
- The bot is built using `Node.js` and `Web3.js`

## How does the bot work? An overview!

This bot interacts with three external components:

1. `MongoDB Atlas`: NoSQL database used to store all the sale data
2. `Twitter`: We use `twitter-api-v2` to create a new tweet everytime a sale takes place!
3. `Discord`: we use `discord.js` to send a message to a Discord channel everytime a new sale takes place!

The bot uses a Web3 Listener using a socket connection. We use [infura](https://infura.io/) as the socket provider. The bot records each `Transfer` event for the given contract address, i.e. records everytime one NFT is transferred from one address to another (including mints).
However, we funnel out mint and normal transfer transactions and only record actual sales. This is done by using two conditions: the value od the transaction and if the sender (from) was the contract address.

Once the bot detects that a sale has been made, we capture multiple datapoints from the transaction. The sample record looks like this:

```
{
    "value":"1.16",
    "to":"0x28c6E39ee95a4073606E7Db07d3aA9D0d391149f",
    "from":"0xD313093397F7C85ABF56f594A83Dfcd0B4fcC436",
    "timestamp":{"$numberInt":"1650323563"},
    "tokenId":"413"
}
```
We then use the above record to store the transcation data in MongoDB, to create a new tweet and to send a message on a Discord channel.

<i>Fun Fact: The bot is capable of detecting both ETH and WETH transfers for value! </i>

## Structure of the repo

- `server.js` is the main executable file.
- `utils` folders holds all the smaller utilities such as processing metadata for image retrieval, price converter from ETH to USD, contract ABI etc.
- `handlers` folder holds all the required code to interact with MongoDB, Discord and Twitter using their libraries and SDKs.

## Using the bot for your own project

You would need to have node and npm installed (preferrable v16 or above).
1. Run `npm install`
2. Create a `.env` file in the root folder with the following variables and put in your credentials.
```
MONGO_URL = "key goes here"
WEB3_PROVIDER = "key goes here"
WEB3_SOCKET_PROVIDER = "key goes here"
DATABASE = "key goes here"
COLLECTION = "key goes here"
TWTR_API_KEY= "key goes here"
TWTR_API_KEY_SECRET= "key goes here"
TWTR_ACCESS_TOKEN= "key goes here"
TWTR_ACCESS_TOKEN_SECRET= "key goes here"
DISCORD_BOT_TOKEN = 'key goes here'
DISCORD_CHANNEL_ID= 'key goes here'
CONTRACT_ADDRESS = "key goes here"
```
View the next section for more info on this!

3. Run `npm start`

And voila!

To run it in production, you can host this bot on Heroku or EC2 or any similar service that supports Node.js!

## Preparing your applications to run the bot

To run this bot, we need a MongoDB cloud cluster, relevant keys for Twitter and Discord.
You can use the following links which will take you to the official developer documentation for Twitter and Discord and to MongoDB Atlas.

1. [Discord developer portal](https://discord.com/developers/applications)
2. [Twitter developer portal](https://developer.twitter.com/en/docs/platform-overview)
3. [MongoDB Cloud](https://cloud.mongodb.com)

Do ensure that your Twitter Application has `Read and Write` permissions and that your Discord bot is added to the `guild`.

In case you are still struggling feel free to reach out to [us](https://twitter.com/themetav3rse?s=20&t=C5Hv_osg-0MF0uyPKSCxaA).

### See this bot live in action on [Twitter](https://twitter.com/MV3SalesBot)