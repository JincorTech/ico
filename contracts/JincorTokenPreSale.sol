pragma solidity ^0.4.11;


import "./Haltable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./JincorToken.sol";
import "./PaymentGateway.sol";


contract JincorTokenPreSale is Haltable, PaymentGateway {
  using SafeMath for uint;

  string public constant name = "Jincor Token PreSale";

  JincorToken public token;

  address public beneficiary;

  uint public hardCap;

  uint public softCap;

  uint public price;

  uint public purchaseLimit;

  uint public collected = 0;

  uint public tokensSold = 0;

  uint public investorCount = 0;

  uint public weiRefunded = 0;

  uint public startBlock;

  uint public endBlock;

  bool public softCapReached = false;

  bool public crowdsaleFinished = false;

  mapping (address => bool) refunded;

  event SoftCapReached(uint softCap);

  event NewContribution(address indexed holder, uint tokenAmount, uint etherAmount);

  event Refunded(address indexed holder, uint amount);

  modifier preSaleActive() {
    require(block.number >= startBlock && block.number < endBlock);
    _;
  }

  modifier preSaleEnded() {
    require(block.number >= endBlock);
    _;
  }

  function JincorTokenPreSale(
    uint _hardCapUSD,
    uint _softCapUSD,
    address _token,
    address _beneficiary,
    uint _totalTokens,
    uint _priceETH,
    uint _purchaseLimitUSD,

    uint _startBlock,
    uint _endBlock
  ) {
    hardCap = _hardCapUSD.mul(1 ether).div(_priceETH);
    softCap = _softCapUSD.mul(1 ether).div(_priceETH);
    price = _totalTokens.mul(1 ether).div(hardCap);

    purchaseLimit = _purchaseLimitUSD.mul(1 ether).div(_priceETH).mul(price);
    token = JincorToken(_token);
    beneficiary = _beneficiary;

    startBlock = _startBlock;
    endBlock = _endBlock;
  }

  function() payable {
    require(msg.value >= 0.1 * 1 ether);
    doPurchase(msg.sender);
  }

  function refund() external preSaleEnded inNormalState {
    require(softCapReached == false);
    require(refunded[msg.sender] == false);

    uint balance = token.balanceOf(msg.sender);
    require(balance > 0);

    uint refund = balance.div(price);
    if (refund > this.balance) {
      refund = this.balance;
    }

    msg.sender.transfer(refund);
    refunded[msg.sender] = true;
    weiRefunded = weiRefunded.add(refund);
    Refunded(msg.sender, refund);
  }

  function withdraw() external onlyOwner {
    require(softCapReached);
    beneficiary.transfer(collected);
    token.transfer(beneficiary, token.balanceOf(this));
    crowdsaleFinished = true;
  }

  function setPaymentGatewayAgent(address to) external onlyOwner returns (bool) {
    require(to != address(0) && to != paymentGatewayAgent);
    paymentGatewayAgent = to;
    return true;
  }

  function transferWithPaymentGateway(bytes6 gatewayId, bytes32 transactionId, address to, uint tokensAmount) external preSaleActive inNormalState returns (bool) {
    return transferWithPaymentGatewayInternal(token, gatewayId, transactionId, to, tokensAmount);
  }

  function doPurchase(address _owner) private preSaleActive inNormalState {
    require(!crowdsaleFinished);
    require(collected.add(msg.value) <= hardCap);

    if (!softCapReached && collected < softCap && collected.add(msg.value) >= softCap) {
      softCapReached = true;
      SoftCapReached(softCap);
    }

    uint tokens = msg.value.mul(price);
    require(token.balanceOf(msg.sender).add(tokens) <= purchaseLimit);

    if (token.balanceOf(msg.sender) == 0) investorCount++;

    collected = collected.add(msg.value);

    token.transfer(msg.sender, tokens);

    tokensSold = tokensSold.add(tokens);

    NewContribution(_owner, tokens, msg.value);
  }
}
