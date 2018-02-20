const JincorToken = artifacts.require("JincorToken");
const JincorTokenPreSale = artifacts.require("JincorTokenPreSale");

const assertJump = function(error) {
  assert.isAbove(error.message.search('VM Exception while processing transaction: revert'), -1, 'Invalid opcode error must be returned');
};

module.exports.TestPaymentGatewayMethods = function (accounts, token, contract) {
  describe('PaymentGateway methods', () => {
    const paymentGatewayAccount = accounts[9];

    beforeEach(async function () {
      await contract(this).setPaymentGatewayAgent(paymentGatewayAccount);
      await token(this).setTransferAgent(paymentGatewayAccount, true);
    });

    describe('payment gateway agent', () => {
      it('should allow reset payment agent', async function () {
        await contract(this).setPaymentGatewayAgent(accounts[2]);
      });

      it('should not allow set to same payment agent', async function () {
        try {
          await contract(this).setPaymentGatewayAgent(paymentGatewayAccount);
        } catch (error) {
          return assertJump(error);
        }
        assert.fail('should have thrown before');
      });

      it('should not allow to set payment agent by unknown account', async function () {
        try {
          await contract(this).setPaymentGatewayAgent(accounts[3], {from: accounts[8]});
        } catch (error) {
          return assertJump(error);
        }
        assert.fail('should have thrown before');
      });
    });

    const paymentGatewayId = '0x123456789012';
    const transactionIpnId = '0xf33afe0b5b56dfb6584d308d7b5e4c04f33afe0b5b56dfb6584d308d7b5e4c04';

    const transferWithPaymentGateway = async (crowdsale, fromAccount, amount) => {
      return await crowdsale.transferWithPaymentGateway(
        paymentGatewayId, transactionIpnId, accounts[2], amount || 0, {from: fromAccount}
      );
    }

    describe('after success transfer', async () => {
      beforeEach(async function () {
        this.tx = await transferWithPaymentGateway(contract(this), paymentGatewayAccount, 500000);
      });

      it('should get balance of account which tokens was transferred to him', async function () {
        assert.equal(await token(this).balanceOf(accounts[2]), 500000);
      });

      it('should get amount for registered payment gateway and txId', async function () {
        assert.equal(await contract(this).getTokensAmountByPaymentGateway(paymentGatewayId, transactionIpnId, accounts[2]), 500000);
      });

      it('should throw when get amount for unknown payment gateway id', async function () {
        try {
          assert.equal(await contract(this).getTokensAmountByPaymentGateway('0xbeerfacebear', transactionIpnId, accounts[5]), 0);
        } catch (error) {
          return assertJump(error);
        }
        assert.fail('should have thrown before');
      });

      it('should throw when get amount for unknown account', async function () {
        try {
          assert.equal(await contract(this).getTokensAmountByPaymentGateway(paymentGatewayId, transactionIpnId, accounts[5]), 0);
        } catch (error) {
          return assertJump(error);
        }
        assert.fail('should have thrown before');
      });

      it('should get emitted event', async function () {
        assert.equal(this.tx.logs[0].event, 'PaymentGatewayTransfer');
      });
    });

    describe('when transfer is failed', () => {
      it('should not transfer tokens with empty amount', async function () {
        try {
          await transferWithPaymentGateway(contract(this), paymentGatewayAccount, 0);
        } catch (error) {
          return assertJump(error);
        }
        assert.fail('should have thrown before');
      });

      it('should not transfer tokens by not permitted account', async function () {
        try {
          await transferWithPaymentGateway(contract(this), accounts[0]);
        } catch (error) {
          return assertJump(error);
        }
        assert.fail('should have thrown before');
      });

      it('should not transfer when identical request was made', async function () {
        await transferWithPaymentGateway(contract(this), paymentGatewayAccount, 500000);
        try {
          await transferWithPaymentGateway(contract(this), paymentGatewayAccount, 500000);
        } catch (error) {
          return assertJump(error);
        }
        assert.fail('should have thrown before');
      });
    });
  });
};
