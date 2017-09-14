var SafeMath = artifacts.require('./SafeMath.sol');
var JincorToken = artifacts.require("./JincorToken.sol");
var JincorTokenPreSale = artifacts.require("./JincorTokenPreSale.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, JincorToken);
  deployer.link(SafeMath, JincorTokenPreSale);
  deployer.deploy(JincorToken).then(function() {
    const hardCap = 350000; //in USD
    const softCap = 150000; //in USD
    const token = JincorToken.address;
    const totalTokens = 1400000; //NOT in wei, converted by contract
    const limit = 50000; //in USD
    const beneficiary = web3.eth.accounts[0];
    const startBlock = web3.eth.blockNumber;
    const endBlock = web3.eth.blockNumber + 100;
    deployer.deploy(JincorTokenPreSale, hardCap, softCap, token, beneficiary, totalTokens, 255, limit, startBlock, endBlock);
  });
};
