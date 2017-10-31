pragma solidity ^0.4.11;


import "./Haltable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./JincorToken.sol";
import "./InvestorWhiteList.sol";
import "./abstract/PriceReceiver.sol";


contract JincorTokenICO is Haltable, PriceReceiver {
  using SafeMath for uint;

  string public constant name = "Jincor Token ICO";

  JincorToken public token;

  address public beneficiary;

  address public constant preSaleAddress = 0x949C9B8dFf9b264CAD57F69Cd98ECa1338F05B39;

  InvestorWhiteList public investorWhiteList;

  uint public constant jcrUsdRate = 100; //in cents

  uint public jcrEthRate;

  uint public jcrBtcRate;

  uint public hardCap;

  uint public softCap;

  uint public collected = 0;

  uint public tokensSold = 0;

  uint public weiRefunded = 0;

  uint public startBlock;

  uint public endBlock;

  bool public softCapReached = false;

  bool public crowdsaleFinished = false;

  mapping (address => uint) public deposited;

  event SoftCapReached(uint softCap);

  event NewContribution(address indexed holder, uint tokenAmount, uint etherAmount);

  event NewReferralTransfer(address indexed investor, address indexed referral, uint tokenAmount);

  event Refunded(address indexed holder, uint amount);

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

  modifier inWhiteList() {
    require(investorWhiteList.isAllowed(msg.sender));
    _;
  }

  function JincorTokenICO(
    uint _hardCapJCR,
    uint _softCapJCR,
    address _token,
    address _beneficiary,
    address _investorWhiteList,
    uint _baseEthUsdPrice,
    uint _baseBtcUsdPrice,

    uint _startBlock,
    uint _endBlock
  ) {
    hardCap = _hardCapJCR.mul(1 ether);
    softCap = _softCapJCR.mul(1 ether);

    token = JincorToken(_token);
    beneficiary = _beneficiary;
    investorWhiteList = InvestorWhiteList(_investorWhiteList);

    startBlock = _startBlock;
    endBlock = _endBlock;

    jcrEthRate = _baseEthUsdPrice.div(jcrUsdRate);
    jcrBtcRate = _baseBtcUsdPrice.div(jcrUsdRate);
  }

  function() payable minInvestment inWhiteList {
    doPurchase();
  }

  function refund() external icoEnded inNormalState {
    require(softCapReached == false);
    require(deposited[msg.sender] > 0);

    uint refund = deposited[msg.sender];

    deposited[msg.sender] = 0;
    msg.sender.transfer(refund);

    weiRefunded = weiRefunded.add(refund);
    Refunded(msg.sender, refund);
  }

  function withdraw() external onlyOwner {
    require(softCapReached);
    beneficiary.transfer(collected);
    token.transfer(beneficiary, token.balanceOf(this));
    crowdsaleFinished = true;
  }

  function calculateBonus(uint tokens) internal constant returns (uint bonus) {
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

  function calculateReferralBonus(uint tokens) internal constant returns (uint bonus) {
    if (msg.value < 100 * (1 ether)) {
      return 0;
    }

    if (msg.value >= 100 * (1 ether) && msg.value < 250 * (1 ether)) {
      return tokens.div(100).mul(3);
    }

    if (msg.value >= 250 * (1 ether) && msg.value < 500 * (1 ether)) {
      return tokens.div(100).mul(4);
    }

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

  function receiveEthPrice(uint ethUsdPrice) external onlyEthPriceProvider {
    require(ethUsdPrice > 0);
    jcrEthRate = ethUsdPrice.div(jcrUsdRate);
  }

  function receiveBtcPrice(uint btcUsdPrice) external onlyBtcPriceProvider {
    require(btcUsdPrice > 0);
    jcrBtcRate = btcUsdPrice.div(jcrUsdRate);
  }

  function setEthPriceProvider(address provider) external onlyOwner {
    require(provider != 0x0);
    ethPriceProvider = provider;
  }

  function setBtcPriceProvider(address provider) external onlyOwner {
    require(provider != 0x0);
    btcPriceProvider = provider;
  }

  function setNewWhiteList(address newWhiteList) external onlyOwner {
    require(newWhiteList != 0x0);
    investorWhiteList = InvestorWhiteList(newWhiteList);
  }

  function doPurchase() private icoActive inNormalState {
    require(!crowdsaleFinished);

    uint tokens = msg.value.mul(jcrEthRate);
    uint referralBonus = calculateReferralBonus(tokens);
    address referral = investorWhiteList.getReferralOf(msg.sender);

    tokens = tokens.add(calculateBonus(tokens));

    uint newTokensSold = tokensSold.add(tokens);

    if (referralBonus > 0 && referral != 0x0) {
      newTokensSold = newTokensSold.add(referralBonus);
    }

    require(newTokensSold <= hardCap);

    if (!softCapReached && tokensSold < softCap && newTokensSold >= softCap) {
      softCapReached = true;
      SoftCapReached(softCap);
    }

    collected = collected.add(msg.value);

    tokensSold = newTokensSold;

    deposited[msg.sender] = deposited[msg.sender].add(msg.value);

    token.transfer(msg.sender, tokens);
    NewContribution(msg.sender, tokens, msg.value);

    if (referralBonus > 0 && referral != 0x0) {
      token.transfer(referral, referralBonus);
      NewReferralTransfer(msg.sender, referral, referralBonus);
    }
  }

  function transferOwnership(address newOwner) onlyOwner icoEnded {
    super.transferOwnership(newOwner);
  }
}
