var SafeMath = artifacts.require('./SafeMath.sol');
var JincorToken = artifacts.require("./JincorToken.sol");
var JincorTokenPreSale = artifacts.require("./JincorTokenPreSale.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, JincorToken);
  deployer.link(SafeMath, JincorTokenPreSale);
  deployer.deploy(JincorToken).then(function() {
    const hardCap = web3.toWei(1372, "ether") * 255; //in USD
    const softCap = 150000;
    const price = web3.toWei(0.000980392158, "ether") * 255; //in USD
    const token = JincorToken.address;
    const totalTokens = web3.toWei(1400000, "ether");
    const limit = 50000;
    const beneficiary = web3.eth.accounts[0];
    const startBlock = web3.eth.blockNumber;
    const endBlock = web3.eth.blockNumber + 100;
    deployer.deploy(JincorTokenPreSale, hardCap, softCap, token, beneficiary, totalTokens, 255, limit, startBlock, endBlock);
  });
};
