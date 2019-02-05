module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      gas: 7900000,
      network_id: '*' // Match any network id
    },
  },
  compilers: {
    solc: {
      version: "0.5.3",
      optimizer: {
        enabled: true,
        runs: 200,
      }
    }
  }

};
