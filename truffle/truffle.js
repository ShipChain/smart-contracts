module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 999999
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
      network_id: "*"
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
