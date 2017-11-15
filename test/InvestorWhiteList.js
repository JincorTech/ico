const ReferralWhiteList = artifacts.require("InvestorWhiteList");

const should = require('chai')
  .use(require('chai-as-promised'))
  .should();

contract("InvestorWhiteList", function (accounts) {
  beforeEach(async function () {
    this.whiteList = await ReferralWhiteList.new();
  });

  it('should allow only owner to add new investor to whitelist', async function () {
    await this.whiteList.addInvestorToWhiteList(accounts[1]);
    const result = await this.whiteList.isAllowed.call(accounts[1]);

    assert.equal(true, result);

    //should not allow to add 1 more time
    await this.whiteList.addInvestorToWhiteList(accounts[1]).should.be.rejectedWith('invalid opcode');

    //should not allow to call by not owner
    await this.whiteList.addInvestorToWhiteList(accounts[2], { from: accounts[2] }).should.be.rejectedWith('invalid opcode');
  });

  it('should allow only owner to remove investor from whitelist', async function () {
    await this.whiteList.addInvestorToWhiteList(accounts[1]);

    //should not allow to call by not owner
    await this.whiteList.removeInvestorFromWhiteList(accounts[1], { from: accounts[2] }).should.be.rejectedWith('invalid opcode');

    await this.whiteList.removeInvestorFromWhiteList(accounts[1]);

    const result = await this.whiteList.isAllowed.call(accounts[1]);
    assert.equal(false, result);

    //should not allow to remove 1 more time
    await this.whiteList.removeInvestorFromWhiteList(accounts[1]).should.be.rejectedWith('invalid opcode');
  });

  it('should allow only owner to add new referral', async function () {
    await this.whiteList.addReferralOf(accounts[1], accounts[2]);

    const referral = await this.whiteList.getReferralOf.call(accounts[1]);
    assert.equal(accounts[2], referral);

    //should not allow to add 1 more time
    await this.whiteList.addReferralOf(accounts[1], accounts[2]).should.be.rejectedWith('invalid opcode');

    //should not allow zero address values
    await this.whiteList.addReferralOf(0x0, accounts[4]).should.be.rejectedWith('invalid opcode');
    await this.whiteList.addReferralOf(accounts[3], 0x0).should.be.rejectedWith('invalid opcode');

    //should not allow to set referral address same as investor
    await this.whiteList.addReferralOf(accounts[4], accounts[4]).should.be.rejectedWith('invalid opcode');

    //should not allow to call by not owner
    await this.whiteList.addReferralOf(accounts[3], accounts[4], { from: accounts[2] }).should.be.rejectedWith('invalid opcode');
  });
});
