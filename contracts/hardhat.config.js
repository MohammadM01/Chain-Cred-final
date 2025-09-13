require('dotenv').config();
require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: "0.8.20",
  networks: {
    opbnbTestnet: {
      url: process.env.OPBNB_TESTNET_RPC || "https://opbnb-testnet-rpc.bnbchain.org",
      chainId: 5611,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
