const TestRPC = require("ethereumjs-testrpc");

//create 10 accounts with 1000000 ETH Balance
const server = TestRPC.server({
  accounts: [
    {
      balance: 0xd3c21bcecceda0000000
    },
    {
      balance: 0xd3c21bcecceda0000000
    },
    {
      balance: 0xd3c21bcecceda0000000
    },
    {
      balance: 0xd3c21bcecceda0000000
    },
    {
      balance: 0xd3c21bcecceda0000000
    },
    {
      balance: 0xd3c21bcecceda0000000
    },
    {
      balance: 0xd3c21bcecceda0000000
    },
    {
      balance: 0xd3c21bcecceda0000000
    },
    {
      balance: 0xd3c21bcecceda0000000
    },
    {
      balance: 0xd3c21bcecceda0000000
    },
  ],
  debug: true,
  logger: console
});

server.listen(8545);
