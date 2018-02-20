module.exports = {
  networks: {
    development: {
      host: "rpc",
      port: 8545,
      network_id: "*", // Match any network id,
      gas: 3500000
    }
  },
};
