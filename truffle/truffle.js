const { readFileSync } = require('fs')
const path = require('path')
const LoomTruffleProvider = require('loom-truffle-provider')

module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 999999
    }
  },
  networks: {
    shipchain_dapp_chain: {
      provider: function() {
        const privateKey = readFileSync(path.join(__dirname, 'private_key'), 'utf-8')
        const chainId = 'default'
        const writeUrl = 'https://shipchain-testnet-beta.network.shipchain.io:46658/rpc'
        const readUrl = 'https://shipchain-testnet-beta.network.shipchain.io:46658/query'
        const loomTruffleProvider = new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
        return loomTruffleProvider
      },
      network_id: '*'
    },
    development: {
      host: "ganache",
      port: 8545,
      network_id: "*"
    },
    gui: {
      host: "outside",
      port: 7545,
      network_id: "*"
    },
    circleci: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    coverage: {
      host: "localhost",
      port: 8555,
      network_id: "*",
      gas: 0xfffffffffff,
      gasPrice: 0x01
    }
  },
  mocha: {
    useColors: true,
    reporter: 'mocha-multi-reporters',
    reporterOptions: {
      configFile: './mocha-reporter-config.json',
    }
  },
};
