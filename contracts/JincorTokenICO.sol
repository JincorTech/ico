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

  uint public ethUsdRate;

  uint public btcUsdRate;

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

  uint constant VOLUME_20_REF_7 = 5000 ether;

  uint constant VOLUME_15_REF_6 = 2000 ether;

  uint constant VOLUME_12d5_REF_5d5 = 1000 ether;

  uint constant VOLUME_10_REF_5 = 500 ether;

  uint constant VOLUME_7_REF_4 = 250 ether;

  uint constant VOLUME_5_REF_3 = 100 ether;

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

    ethUsdRate = _baseEthUsdPrice;
    btcUsdRate = _baseBtcUsdPrice;
  }

  function() payable minInvestment inWhiteList {
    doPurchase();
  }

  function refund() external icoEnded {
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
    if (msg.value >= VOLUME_20_REF_7) {
      return tokens.mul(20).div(100);
    }

    if (msg.value >= VOLUME_15_REF_6) {
      return tokens.mul(15).div(100);
    }

    if (msg.value >= VOLUME_12d5_REF_5d5) {
      return tokens.mul(125).div(1000);
    }

    if (msg.value >= VOLUME_10_REF_5) {
      return tokens.mul(10).div(100);
    }

    if (msg.value >= VOLUME_7_REF_4) {
      return tokens.mul(7).div(100);
    }

    if (msg.value >= VOLUME_5_REF_3) {
      return tokens.mul(5).div(100);
    }

    return 0;
  }

  function calculateReferralBonus(uint tokens) internal constant returns (uint bonus) {
    if (msg.value >= VOLUME_20_REF_7) {
      return tokens.mul(7).div(100);
    }

    if (msg.value >= VOLUME_15_REF_6) {
      return tokens.mul(6).div(100);
    }

    if (msg.value >= VOLUME_12d5_REF_5d5) {
      return tokens.mul(55).div(1000);
    }

    if (msg.value >= VOLUME_10_REF_5) {
      return tokens.mul(5).div(100);
    }

    if (msg.value >= VOLUME_7_REF_4) {
      return tokens.mul(4).div(100);
    }

    if (msg.value >= VOLUME_5_REF_3) {
      return tokens.mul(3).div(100);
    }

    return 0;
  }

  function receiveEthPrice(uint ethUsdPrice) external onlyEthPriceProvider {
    require(ethUsdPrice > 0);
    ethUsdRate = ethUsdPrice;
  }

  function receiveBtcPrice(uint btcUsdPrice) external onlyBtcPriceProvider {
    require(btcUsdPrice > 0);
    btcUsdRate = btcUsdPrice;
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

    uint tokens = msg.value.mul(ethUsdRate).div(jcrUsdRate);
    uint referralBonus = calculateReferralBonus(tokens);
    address referral = investorWhiteList.getReferralOf(msg.sender);

    tokens = tokens.add(calculateBonus(tokens));

    uint newTokensSold = tokensSold.add(tokens);

    if (referralBonus > 0 && referral != 0x0) {
      newTokensSold = newTokensSold.add(referralBonus);
    }

    require(newTokensSold <= hardCap);

    if (!softCapReached && newTokensSold >= softCap) {
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
