module.exports = {
  compilers: {
    solc: {
      version: "native",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
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
