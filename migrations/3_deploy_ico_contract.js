var SafeMath = artifacts.require('./SafeMath.sol');
var JincorToken = artifacts.require("./JincorToken.sol");
var JincorTokenICO = artifacts.require("./JincorTokenICO.sol");
var EthPriceProvider = artifacts.require("./EthPriceProvider.sol");
var BtcPriceProvider = artifacts.require("./BtcPriceProvider.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, JincorToken);
  deployer.link(SafeMath, JincorTokenICO);
  deployer.deploy(JincorToken).then(async function() {
    const hardCap = 26600000; //in JCR
    const softCap = 2500000; //in JCR
    const token = JincorToken.address;
    const beneficiary = web3.eth.accounts[0];
    const startBlock = web3.eth.blockNumber;
    const endBlock = web3.eth.blockNumber + 2000;
    await deployer.deploy(JincorTokenICO, hardCap, softCap, token, beneficiary, 25500, 420000, startBlock, endBlock);
    await deployer.deploy(EthPriceProvider);
    await deployer.deploy(BtcPriceProvider);

    const icoInstance = web3.eth.contract(JincorTokenICO.abi).at(JincorTokenICO.address);
    const ethProvider = web3.eth.contract(EthPriceProvider.abi).at(EthPriceProvider.address);
    const btcProvider = web3.eth.contract(BtcPriceProvider.abi).at(BtcPriceProvider.address);

    icoInstance.setEthPriceProvider(EthPriceProvider.address, { from: web3.eth.accounts[0] });
    icoInstance.setBtcPriceProvider(BtcPriceProvider.address, { from: web3.eth.accounts[0] });
    ethProvider.setWatcher(JincorTokenICO.address, { from: web3.eth.accounts[0] });
    btcProvider.setWatcher(JincorTokenICO.address, { from: web3.eth.accounts[0] });

    //start update and send ETH to cover Oraclize fees
    ethProvider.startUpdate({ value: web3.toWei(1000), from: web3.eth.accounts[0], gas: 200000 });
    btcProvider.startUpdate({ value: web3.toWei(1000), from: web3.eth.accounts[0], gas: 200000 });
  });
};
