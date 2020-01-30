module.exports = {
  compilers: {
    solc: {
      version: "native",
      settings: {
        optimizer: {
          enabled: true,
          runs: 999999
        }
      }
    }
  },
  networks: {
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
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      //from: "0x0085f8e72391Ce4BB5ce47541C846d059399fA6c", // default address to use for any transaction Truffle makes during migrations
      from: "0x15f0f6c86547cd816EBc9B75bc800cF720549123",
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
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
