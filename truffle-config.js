/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation, and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * https://trufflesuite.com/docs/truffle/reference/configuration
 *
 * Hands-off deployment with Infura
 * --------------------------------
 *
 * Do you have a complex application that requires lots of transactions to deploy?
 * Use this approach to make deployment a breeze 🏖️:
 *
 * Infura deployment needs a wallet provider (like @truffle/hdwallet-provider)
 * to sign transactions before they're sent to a remote public node.
 * Infura accounts are available for free at 🔍: https://infura.io/register
 *
 * You'll need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. You can store your secrets 🤐 in a .env file.
 * In your project root, run `$ npm install dotenv`.
 * Create .env (which should be .gitignored) and declare your MNEMONIC
 * and Infura PROJECT_ID variables inside.
 * For example, your .env file will have the following structure:
 *
 * MNEMONIC = <Your 12 phrase mnemonic>
 * PROJECT_ID = <Your Infura project id>
 *
 * Deployment with Truffle Dashboard (Recommended for best security practice)
 * --------------------------------------------------------------------------
 *
 * Are you concerned about security and minimizing rekt status 🤔?
 * Use this method for best security:
 *
 * Truffle Dashboard lets you review transactions in detail, and leverages
 * MetaMask for signing, so there's no need to copy-paste your mnemonic.
 * More details can be found at 🔎:
 *
 * https://trufflesuite.com/docs/truffle/getting-started/using-the-truffle-dashboard/
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = process.env.MNEMONIC;
const infuraProjectId = process.env.INFURA_PROJECT_ID;
// const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider(mnemonic, `https://sepolia.infura.io/v3/${infuraProjectId}`),
      network_id: 11155111, // Sepolia network ID
      gas: 4500000,
      gasPrice: 10000000,
      timeoutBlocks: 500, // Increase timeout blocks
      networkCheckTimeout: 2000000, // Increase network check timeout
      confirmations: 2, // Number of confirmations to wait between deployments
      deploymentPollingInterval: 15000, // Increase deployment polling interval
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  },
  mocha: {
    // timeout: 100000
  },
  compilers: {
    solc: {
      version: '0.8.21', // Specify the Solidity compiler version
    },
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  // api_keys: {
  //   etherscan: etherscanApiKey
  // },
  contracts_build_directory: "./src/contracts"
};
