pragma solidity ^0.4.11;


import "./Haltable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./JincorToken.sol";


contract JincorTokenICO is Ownable, Haltable {
  using SafeMath for uint;

  string public name = "Jincor Token ICO";

  JincorToken public token;

  address public beneficiary;

  address public preSaleAddress = 0x949C9B8dFf9b264CAD57F69Cd98ECa1338F05B39;

  uint public hardCap;

  uint public softCap;

  uint public price;

  uint public collected = 0;

  uint public weiRefunded = 0;

  uint public startBlock;

  uint public endBlock;

  bool public softCapReached = false;

  bool public crowdsaleFinished = false;

  mapping (address => uint256) public deposited;

  event SoftCapReached(uint softCap);

  event NewContribution(address indexed holder, uint256 tokenAmount, uint256 etherAmount);

  event Refunded(address indexed holder, uint256 amount);

  modifier icoActive() {
    require(block.number >= startBlock && block.number < endBlock);
    _;
  }

  modifier icoEnded() {
    require(block.number >= endBlock);
    _;
  }

  modifier minInvestment() {
    require(msg.value >= 1 ether);
    _;
  }

  modifier minReferralInvestment() {
    require(msg.value >= 500 ether);
    _;
  }

  function JincorTokenICO(
    uint _hardCapUSD,
    uint _softCapUSD,
    address _token,
    address _beneficiary,
    uint _totalTokens,
    uint _priceETH,

    uint _startBlock,
    uint _endBlock
  ) {
    hardCap = _hardCapUSD.mul(1 ether).div(_priceETH);
    softCap = _softCapUSD.mul(1 ether).div(_priceETH);
    price = _totalTokens.mul(1 ether).div(hardCap);

    token = JincorToken(_token);
    beneficiary = _beneficiary;

    startBlock = _startBlock;
    endBlock = _endBlock;
  }

  function() payable minInvestment {
    doPurchase(msg.sender);
  }

  function refund() external icoEnded inNormalState {
    require(softCapReached == false);
    require(deposited[msg.sender] > 0);

    uint256 refund = deposited[msg.sender];
    if (refund > this.balance) {
      refund = this.balance;
    }

    assert(msg.sender.send(refund));
    deposited[msg.sender] = 0;
    weiRefunded = weiRefunded.add(refund);
    Refunded(msg.sender, refund);
  }

  function withdraw() onlyOwner {
    require(softCapReached);
    assert(beneficiary.send(collected));
    token.transfer(beneficiary, token.balanceOf(this));
    crowdsaleFinished = true;
  }

  function calculateBonus(uint256 tokens) private returns (uint bonus) {
    if (msg.value < 100 * (1 ether)) {
      return 0;
    }

    if (msg.value >= 100 * (1 ether) && msg.value < 250 * (1 ether)) {
      return tokens.div(100).mul(5);
    }

    if (msg.value >= 250 * (1 ether) && msg.value < 500 * (1 ether)) {
      return tokens.div(100).mul(7);
    }

    if (msg.value >= 500 * (1 ether) && msg.value < 1000 * (1 ether)) {
      return tokens.div(100).mul(10);
    }

    if (msg.value >= 1000 * (1 ether) && msg.value < 2000 * (1 ether)) {
      return tokens.div(1000).mul(125);
    }

    if (msg.value >= 2000 * (1 ether) && msg.value < 5000 * (1 ether)) {
      return tokens.div(100).mul(15);
    }

    if (msg.value >= 5000 * (1 ether)) {
      return tokens.div(100).mul(20);
    }
  }

  function calculateReferralBonus(uint256 tokens) private returns (uint bonus) {
    assert(msg.value >= 500 * (1 ether));

    if (msg.value >= 500 * (1 ether) && msg.value < 1000 * (1 ether)) {
      return tokens.div(100).mul(5);
    }

    if (msg.value >= 1000 * (1 ether) && msg.value < 2000 * (1 ether)) {
      return tokens.div(1000).mul(55);
    }

    if (msg.value >= 2000 * (1 ether) && msg.value < 5000 * (1 ether)) {
      return tokens.div(100).mul(6);
    }

    if (msg.value >= 5000 * (1 ether)) {
      return tokens.div(100).mul(7);
    }
  }

  function doPurchaseWithReferralBonus(address referral)
  payable
  external
  minReferralInvestment
  inNormalState
  icoActive {
    require(!crowdsaleFinished);
    require(collected.add(msg.value) <= hardCap);
    require(referral != msg.sender && referral != address(this) && referral != address(token) && referral != preSaleAddress);

    if (!softCapReached && collected < softCap && collected.add(msg.value) >= softCap) {
      softCapReached = true;
      SoftCapReached(softCap);
    }

    uint256 tokens = msg.value.mul(price);
    uint256 referralBonus = calculateReferralBonus(tokens);

    tokens = tokens.add(calculateBonus(tokens));

    collected = collected.add(msg.value);

    token.transfer(msg.sender, tokens);
    token.transfer(referral, referralBonus);

    deposited[msg.sender] = deposited[msg.sender].add(msg.value);

    NewContribution(msg.sender, tokens, msg.value);
  }

  function doPurchase(address _owner) private icoActive inNormalState {
    require(!crowdsaleFinished);
    require(collected.add(msg.value) <= hardCap);

    if (!softCapReached && collected < softCap && collected.add(msg.value) >= softCap) {
      softCapReached = true;
      SoftCapReached(softCap);
    }

    uint256 tokens = msg.value.mul(price);

    tokens = tokens.add(calculateBonus(tokens));

    collected = collected.add(msg.value);

    token.transfer(msg.sender, tokens);

    deposited[_owner] = deposited[_owner].add(msg.value);

    NewContribution(_owner, tokens, msg.value);
  }
}
