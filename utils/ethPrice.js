const ethPrice = require('eth-price');

const getEthToUSDPrice = async () => {
  const price = await ethPrice('usd');
  return price[0].split(': ')[1];
};

module.exports = { getEthToUSDPrice };
