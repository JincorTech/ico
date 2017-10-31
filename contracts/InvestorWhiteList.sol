pragma solidity ^0.4.0;
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract InvestorWhiteList is Ownable {
  struct Investor {
    bool allowed;
    address referral;
  }

  mapping (address => Investor) public investorWhiteList;

  function InvestorWhiteList() {

  }

  function addInvestorToWhiteList(address investor) external onlyOwner {
    require(investor != 0x0 && !investorWhiteList[investor].allowed);
    investorWhiteList[investor].allowed = true;
  }

  function removeInvestorFromWhiteList(address investor) external onlyOwner {
    require(investor != 0x0 && investorWhiteList[investor].allowed);
    investorWhiteList[investor].allowed = false;
  }

  //when new user will contribute ICO contract will automatically send bonus to referral
  function addInvestorToListReferral(address investor, address referral) external onlyOwner {
    require(investor != 0x0 && referral != 0x0 && investorWhiteList[investor].referral == 0x0 && investor != referral && !investorWhiteList[investor].allowed);
    investorWhiteList[investor].allowed = true;
    investorWhiteList[investor].referral = referral;
  }

  function isAllowed(address investor) constant external returns (bool result) {
    return investorWhiteList[investor].allowed;
  }

  function getReferralOf(address investor) constant external returns (address result) {
    return investorWhiteList[investor].referral;
  }
}
