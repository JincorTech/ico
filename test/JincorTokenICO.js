const JincorToken = artifacts.require("JincorToken");
const JincorTokenICO = artifacts.require("JincorTokenICO");
const assertJump = require("zeppelin-solidity/test/helpers/assertJump.js");

const hardCap = 26600000; //in JCR
const softCap = 2500000; //in JCR
const beneficiary = web3.eth.accounts[9];
const ethUsdPrice = 20000; //in cents
const btcUsdPrice = 400000; //in cents
const ethPriceProvider = web3.eth.accounts[8];
const btcPriceProvider = web3.eth.accounts[7];

function advanceToBlock(number) {
  if (web3.eth.blockNumber > number) {
    throw Error(`block number ${number} is in the past (current is ${web3.eth.blockNumber})`)
  }

  while (web3.eth.blockNumber < number) {
    web3.eth.sendTransaction({value: 1, from: web3.eth.accounts[8], to: web3.eth.accounts[7]});
  }
}

contract('JincorTokenICO', function (accounts) {
  beforeEach(async function () {
    this.startBlock = web3.eth.blockNumber;
    this.endBlock = this.startBlock + 20;

    this.token = await JincorToken.new();

    this.crowdsale = await JincorTokenICO.new(hardCap, softCap, this.token.address, beneficiary, ethUsdPrice, btcUsdPrice, this.startBlock, this.endBlock);
    this.token.setTransferAgent(this.token.address, true);
    this.token.setTransferAgent(this.crowdsale.address, true);
    this.token.setTransferAgent(accounts[0], true);

    await this.crowdsale.setEthPriceProvider(ethPriceProvider);
    await this.crowdsale.setBtcPriceProvider(btcPriceProvider);

    //transfer more than hardcap to test hardcap reach properly
    this.token.transfer(this.crowdsale.address, web3.toWei(30000000, "ether"));
  });

  it('should allow to halt by owner', async function () {
    await this.crowdsale.halt();

    const halted = await this.crowdsale.halted();

    assert.equal(halted, true);
  });

  it('should not allow to halt by not owner', async function () {
    try {
      await this.crowdsale.halt({from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to halt if already halted', async function () {
    await this.crowdsale.halt();

    try {
      await this.crowdsale.halt();
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should allow to unhalt by owner', async function () {
    await this.crowdsale.halt();

    await this.crowdsale.unhalt();
    const halted = await this.crowdsale.halted();

    assert.equal(halted, false);
  });

  it('should not allow to unhalt when not halted', async function () {
    try {
      await this.crowdsale.unhalt();
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to unhalt by not owner', async function () {
    await this.crowdsale.halt();

    try {
      await this.crowdsale.unhalt({from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should allow to update ETH price by ETH price provider', async function () {
    await this.crowdsale.receiveEthPrice(25000, {from: ethPriceProvider});

    const jcrEthRate = await this.crowdsale.jcrEthRate();

    assert.equal(jcrEthRate, 250);
  });

  it('should allow to update BTC price by BTC price provider', async function () {
    await this.crowdsale.receiveBtcPrice(420000, {from: btcPriceProvider});

    const jcrUsdRate = await this.crowdsale.jcrBtcRate();

    assert.equal(jcrUsdRate, 4200);
  });

  it('should not allow to update ETH price by not ETH price provider', async function () {
    try {
      await this.crowdsale.receiveEthPrice(25000, {from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to update BTC price by not BTC price provider', async function () {
    try {
      await this.crowdsale.receiveBtcPrice(420000, {from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should allow to set BTC price provider by owner', async function () {
    await this.crowdsale.setBtcPriceProvider(accounts[2], {from: accounts[0]});

    const newPriceProvider = await this.crowdsale.btcPriceProvider();

    assert.equal(accounts[2], newPriceProvider);
  });

  it('should allow to set ETH price provider by owner', async function () {
    await this.crowdsale.setEthPriceProvider(accounts[2], {from: accounts[0]});

    const newPriceProvider = await this.crowdsale.ethPriceProvider();

    assert.equal(accounts[2], newPriceProvider);
  });

  it('should not allow to set BTC price provider by not owner', async function () {
    try {
      await this.crowdsale.setBtcPriceProvider(accounts[2], {from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to set ETH price provider by not owner', async function () {
    try {
      await this.crowdsale.setEthPriceProvider(accounts[2], {from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to update eth price with zero value', async function () {
    try {
      await this.crowdsale.receiveEthPrice(0, {from: ethPriceProvider});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to update btc price with zero value', async function () {
    try {
      await this.crowdsale.receiveBtcPrice(0, {from: btcPriceProvider});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should increase deposit accordingly with several investments', async function () {
    await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[2]});

    const deposited1 = await this.crowdsale.deposited(accounts[2]);
    assert.equal(deposited1.toNumber(), 1 * 10 ** 18);

    await this.crowdsale.sendTransaction({value: 500 * 10 ** 18, from: accounts[2]});

    const deposited2 = await this.crowdsale.deposited(accounts[2]);
    assert.equal(deposited2.toNumber(), 501 * 10 ** 18);

    await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {value: 500 * 10 ** 18, from: accounts[2]});

    const deposited3 = await this.crowdsale.deposited(accounts[2]);
    assert.equal(deposited3.toNumber(), 1001 * 10 ** 18);

    //should not increase deposit of referral
    const deposited4 = await this.crowdsale.deposited(accounts[3]);
    assert.equal(deposited4.toNumber(), 0);
  });

  it('should add 5% bonus for 100-249 ETH investment', async function () {
    await this.crowdsale.sendTransaction({value: 100 * 10 ** 18, from: accounts[2]});

    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 21000 * 10 ** 18);

    await this.crowdsale.sendTransaction({value: 249 * 10 ** 18, from: accounts[3]});

    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 52290 * 10 ** 18);
  });

  it('should add 7% bonus for 250-499 ETH investment', async function () {
    await this.crowdsale.sendTransaction({value: 250 * 10 ** 18, from: accounts[2]});

    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 53500 * 10 ** 18);

    await this.crowdsale.sendTransaction({value: 499 * 10 ** 18, from: accounts[3]});

    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 106786 * 10 ** 18);
  });

  it('should add 10% bonus for 500-999 ETH investment', async function () {
    await this.crowdsale.sendTransaction({value: 500 * 10 ** 18, from: accounts[2]});

    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 110000 * 10 ** 18);

    await this.crowdsale.sendTransaction({value: 999 * 10 ** 18, from: accounts[3]});

    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 219780 * 10 ** 18);
  });

  it('should add 12.5% bonus for 1000-1999 ETH investment', async function () {
    await this.crowdsale.sendTransaction({value: 1000 * 10 ** 18, from: accounts[2]});

    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 225000 * 10 ** 18);

    await this.crowdsale.sendTransaction({value: 1999 * 10 ** 18, from: accounts[3]});

    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 449775 * 10 ** 18);
  });

  it('should add 15% bonus for 2000-4999 ETH investment', async function () {
    await this.crowdsale.sendTransaction({value: 2000 * 10 ** 18, from: accounts[2]});

    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 460000 * 10 ** 18);

    await this.crowdsale.sendTransaction({value: 4999 * 10 ** 18, from: accounts[3]});

    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 1149770 * 10 ** 18);
  });

  it('should add 20% bonus for over 5000 ETH investment', async function () {
    await this.crowdsale.sendTransaction({value: 5000 * 10 ** 18, from: accounts[2]});

    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 1200000 * 10 ** 18);

    await this.crowdsale.sendTransaction({value: 10000 * 10 ** 18, from: accounts[3]});

    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 2400000 * 10 ** 18);
  });

  it('should not allow to call referral purchase with less than 100 ETH investment', async function () {
    try {
      await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {
        value: 99.999999999 * 10 ** 18,
        from: accounts[2],
      });
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to set msg.sender as referral', async function () {
    try {
      await this.crowdsale.doPurchaseWithReferralBonus(accounts[2], {
        value: 500 * 10 ** 18,
        from: accounts[2],
      });
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to set crowdsale contract address as referral', async function () {
    try {
      await this.crowdsale.doPurchaseWithReferralBonus(this.crowdsale.address, {
        value: 500 * 10 ** 18,
        from: accounts[2],
      });
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to set token contract address as referral', async function () {
    try {
      await this.crowdsale.doPurchaseWithReferralBonus(this.token.address, {
        value: 500 * 10 ** 18,
        from: accounts[2],
      });
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to set pre sale contract address as referral', async function () {
    try {
      await this.crowdsale.doPurchaseWithReferralBonus("0x949C9B8dFf9b264CAD57F69Cd98ECa1338F05B39", {
        value: 500 * 10 ** 18,
        from: accounts[2],
      });
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should send 3% referral bonus for 100-249 ETH investment', async function () {
    await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {
      value: 100 * 10 ** 18,
      from: accounts[2],
    });

    //check that investor received proper tokens count
    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 21000 * 10 ** 18);

    //check that sender deposit was increased
    const deposited = await this.crowdsale.deposited(accounts[2]);
    assert.equal(deposited.toNumber(), 100 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 600 * 10 ** 18);

    await this.crowdsale.doPurchaseWithReferralBonus(accounts[5], {
      value: 249 * 10 ** 18,
      from: accounts[4],
    });

    //check that investor received proper tokens count
    const balanceOf4 = await this.token.balanceOf(accounts[4]);
    assert.equal(balanceOf4.valueOf(), 52290 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf5 = await this.token.balanceOf(accounts[5]);
    assert.equal(balanceOf5.valueOf(), 1494 * 10 ** 18);
  });

  it('should send 4% referral bonus for 250-499 ETH investment', async function () {
    await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {
      value: 250 * 10 ** 18,
      from: accounts[2],
    });

    //check that investor received proper tokens count
    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 53500 * 10 ** 18);

    //check that sender deposit was increased
    const deposited = await this.crowdsale.deposited(accounts[2]);
    assert.equal(deposited.toNumber(), 250 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 2000 * 10 ** 18);

    await this.crowdsale.doPurchaseWithReferralBonus(accounts[5], {
      value: 499 * 10 ** 18,
      from: accounts[4],
    });

    //check that investor received proper tokens count
    const balanceOf4 = await this.token.balanceOf(accounts[4]);
    assert.equal(balanceOf4.valueOf(), 106786 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf5 = await this.token.balanceOf(accounts[5]);
    assert.equal(balanceOf5.valueOf(), 3992 * 10 ** 18);
  });

  it('should send 5% referral bonus for 500-999 ETH investment', async function () {
    await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {
      value: 500 * 10 ** 18,
      from: accounts[2],
    });

    //check that investor received proper tokens count
    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 110000 * 10 ** 18);

    //check that sender deposit was increased
    const deposited = await this.crowdsale.deposited(accounts[2]);
    assert.equal(deposited.toNumber(), 500 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 5000 * 10 ** 18);

    await this.crowdsale.doPurchaseWithReferralBonus(accounts[5], {
      value: 999 * 10 ** 18,
      from: accounts[4],
    });

    //check that investor received proper tokens count
    const balanceOf4 = await this.token.balanceOf(accounts[4]);
    assert.equal(balanceOf4.valueOf(), 219780 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf5 = await this.token.balanceOf(accounts[5]);
    assert.equal(balanceOf5.valueOf(), 9990 * 10 ** 18);
  });

  it('should send 5,5% referral bonus for 1000-1999 ETH investment', async function () {
    await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {
      value: 1000 * 10 ** 18,
      from: accounts[2],
    });

    //check that investor received proper tokens count
    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 225000 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 11000 * 10 ** 18);

    await this.crowdsale.doPurchaseWithReferralBonus(accounts[5], {
      value: 1999 * 10 ** 18,
      from: accounts[4],
    });

    //check that investor received proper tokens count
    const balanceOf4 = await this.token.balanceOf(accounts[4]);
    assert.equal(balanceOf4.valueOf(), 449775 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf5 = await this.token.balanceOf(accounts[5]);
    assert.equal(balanceOf5.valueOf(), 21989 * 10 ** 18);
  });

  it('should send 6% referral bonus for 2000-4999 ETH investment', async function () {
    await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {
      value: 2000 * 10 ** 18,
      from: accounts[2],
    });

    //check that investor received proper tokens count
    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 460000 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 24000 * 10 ** 18);

    await this.crowdsale.doPurchaseWithReferralBonus(accounts[5], {
      value: 4999 * 10 ** 18,
      from: accounts[4],
    });

    //check that investor received proper tokens count
    const balanceOf4 = await this.token.balanceOf(accounts[4]);
    assert.equal(balanceOf4.valueOf(), 1149770 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf5 = await this.token.balanceOf(accounts[5]);
    assert.equal(balanceOf5.valueOf(), 59988 * 10 ** 18);
  });

  it('should send 7% referral bonus for 5000 and more ETH investment', async function () {
    await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {
      value: 5000 * 10 ** 18,
      from: accounts[2],
    });

    //check that investor received proper tokens count
    const balanceOf2 = await this.token.balanceOf(accounts[2]);
    assert.equal(balanceOf2.valueOf(), 1200000 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf3 = await this.token.balanceOf(accounts[3]);
    assert.equal(balanceOf3.valueOf(), 70000 * 10 ** 18);

    await this.crowdsale.doPurchaseWithReferralBonus(accounts[5], {
      value: 10000 * 10 ** 18,
      from: accounts[4],
    });

    //check that investor received proper tokens count
    const balanceOf4 = await this.token.balanceOf(accounts[4]);
    assert.equal(balanceOf4.valueOf(), 2400000 * 10 ** 18);

    //check that correct referral bonus is received
    const balanceOf5 = await this.token.balanceOf(accounts[5]);
    assert.equal(balanceOf5.valueOf(), 140000 * 10 ** 18);
  });

  it('should not allow purchase when ICO is halted', async function () {
    await this.crowdsale.halt();

    try {
      await this.crowdsale.sendTransaction({value: 100 * 10 ** 18, from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow referral purchase when ICO is halted', async function () {
    await this.crowdsale.halt();

    try {
      await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {
        value: 500 * 10 ** 18,
        from: accounts[2],
      });
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to send less than 1 ETH', async function () {
    try {
      await this.crowdsale.sendTransaction({value: 0.9999 * 10 ** 18, from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should set flag when softcap is reached', async function () {
    //ICO softcap will be reached with single 10417 ETH investment due to high volume bonus
    await this.crowdsale.sendTransaction({value: 10417 * 10 ** 18, from: accounts[1]});

    const softCapReached = await this.crowdsale.softCapReached();
    assert.equal(softCapReached, true);
  });

  it('should set flag when softcap is reached - referral purchase', async function () {
    //ICO softcap will be reached with single 9843 ETH investment due to high volume and referral bonus
    await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {value: 9843 * 10 ** 18, from: accounts[1]});

    const softCapReached = await this.crowdsale.softCapReached();
    assert.equal(softCapReached, true);
  });

  it('should not allow to exceed hard cap', async function () {
    await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[1]});
    await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[2]});

    try {
      await this.crowdsale.sendTransaction({value: 133000 * 10 ** 18, from: accounts[4]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow to exceed hard cap - referral purchase', async function () {
    await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[1]});
    await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[2]});

    try {
      await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {value: 133000 * 10 ** 18, from: accounts[4]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should allow withdraw only for owner', async function () {
    await this.crowdsale.sendTransaction({value: 20000 * 10 ** 18, from: accounts[1]});

    try {
      await this.crowdsale.withdraw({from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow withdraw when softcap is not reached', async function () {
    await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[1]});

    try {
      await this.crowdsale.withdraw();
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should withdraw - send all not distributed tokens and collected ETH to beneficiary', async function () {
    await this.crowdsale.sendTransaction({value: 12000 * 10 ** 18, from: accounts[1]});
    await this.crowdsale.sendTransaction({value: 500 * 10 ** 18, from: accounts[2]});

    const oldBenBalanceEth = web3.eth.getBalance(beneficiary);
    const oldIcoContractBalanceJcr = await this.token.balanceOf(this.crowdsale.address).valueOf();

    await this.crowdsale.withdraw();

    const newBenBalanceEth = web3.eth.getBalance(beneficiary);
    const newBenBalanceJcr = await this.token.balanceOf(beneficiary).valueOf();
    const icoContractBalanceJcr = await this.token.balanceOf(this.crowdsale.address).valueOf();
    const icoContractBalanceEth = web3.eth.getBalance(this.crowdsale.address);

    assert.equal(icoContractBalanceJcr, 0);
    assert.equal(icoContractBalanceEth, 0);
    assert.equal(newBenBalanceEth.minus(oldBenBalanceEth).toNumber(), web3.toWei(12500));
    assert.equal(newBenBalanceJcr.toNumber(), oldIcoContractBalanceJcr.toNumber());
  });

  it('should not allow referral purchase if ICO is ended', async function () {
    advanceToBlock(this.endBlock);

    try {
      await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {
        value: 500 * 10 ** 18,
        from: accounts[2],
      });
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow purchase if ICO is ended', async function () {
    advanceToBlock(this.endBlock);

    try {
      await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow purchase after withdraw', async function () {
    await this.crowdsale.sendTransaction({value: 12500 * 10 ** 18, from: accounts[2]});
    await this.crowdsale.withdraw();

    try {
      await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow referral purchase after withdraw', async function () {
    await this.crowdsale.doPurchaseWithReferralBonus(accounts[3], {value: 12500 * 10 ** 18, from: accounts[2]});
    await this.crowdsale.withdraw();

    try {
      await this.crowdsale.doPurchaseWithReferralBonus(accounts[4], {value: 500 * 10 ** 18, from: accounts[5]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow refund if ICO is not ended', async function () {
    await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[2]});

    try {
      await this.crowdsale.refund({from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow refund if soft cap is reached', async function () {
    await this.crowdsale.sendTransaction({value: 12000 * 10 ** 18, from: accounts[1]});
    await this.crowdsale.sendTransaction({value: 500 * 10 ** 18, from: accounts[3]});

    advanceToBlock(this.endBlock);

    try {
      await this.crowdsale.refund({from: accounts[3]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should not allow refund if ICO is halted', async function () {
    await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[1]});

    advanceToBlock(this.endBlock);

    await this.crowdsale.halt();

    try {
      await this.crowdsale.refund({from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it('should refund if cap is not reached and ICO is ended', async function () {
    await this.crowdsale.sendTransaction({value: 1 * 10 ** 18, from: accounts[2]});

    advanceToBlock(this.endBlock);

    const balanceBefore = web3.eth.getBalance(accounts[2]);
    await this.crowdsale.refund({from: accounts[2]});

    const balanceAfter = web3.eth.getBalance(accounts[2]);

    assert.equal(balanceAfter > balanceBefore, true);

    const weiRefunded = await this.crowdsale.weiRefunded();
    assert.equal(weiRefunded, 1 * 10 ** 18);

    const deposited = await this.crowdsale.deposited(accounts[2]);
    assert.equal(deposited.toNumber(), 0);
    //should not refund 1 more time
    try {
      await this.crowdsale.refund({from: accounts[2]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });
});
