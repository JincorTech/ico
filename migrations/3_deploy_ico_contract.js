var SafeMath = artifacts.require('./SafeMath.sol');
var JincorToken = artifacts.require("./JincorToken.sol");
var JincorTokenICO = artifacts.require("./JincorTokenICO.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, JincorToken);
  deployer.link(SafeMath, JincorTokenICO);
  deployer.deploy(JincorToken).then(function() {
    const hardCap = 26600000; //in USD
    const softCap = 2500000; //in USD
    const token = JincorToken.address;
    const totalTokens = 26600000; //NOT in wei, converted by contract
    const beneficiary = web3.eth.accounts[0];
    const startBlock = web3.eth.blockNumber;
    const endBlock = web3.eth.blockNumber + 100;
    deployer.deploy(JincorTokenICO, hardCap, softCap, token, beneficiary, totalTokens, 255, startBlock, endBlock);
  });
};
