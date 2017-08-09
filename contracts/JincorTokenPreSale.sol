pragma solidity ^0.4.11;

/*import "./Haltable.sol";*/
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./JincorToken.sol";

contract JincorTokenPreSale is Ownable {
    using SafeMath for uint;

    string public name = "Jincor Token PreSale";

    JincorToken public token;
    address public beneficiary;

    uint public hardCap;
    uint public softCap;
    uint public collected;
    uint public price;
    uint public purchaseLimit;

    uint public tokensSold = 0;
    uint public weiRaised = 0;
    uint public investorCount = 0;
    uint public weiRefunded = 0;

    uint public startTime;
    uint public endTime;

    bool public softCapReached = false;
    bool public crowdsaleFinished = false;

    mapping (address => bool) refunded;

    event GoalReached(uint amountRaised);
    event SoftCapReached(uint softCap);
    event NewContribution(address indexed holder, uint256 tokenAmount, uint256 etherAmount);
    event Refunded(address indexed holder, uint256 amount);

    modifier onlyAfter(uint time) {
        if (now < time) throw;
        _;
    }

    modifier onlyBefore(uint time) {
        if (now > time) throw;
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

        uint _startTime,
        uint _duration
    ) {
        hardCap = _hardCapUSD  * 1 ether / _priceETH;
        softCap = _softCapUSD * 1 ether / _priceETH;
        price = _totalTokens * 1 ether / hardCap;

        purchaseLimit = _purchaseLimitUSD * 1 ether / _priceETH * price;
        token = JincorToken(_token);
        beneficiary = _beneficiary;

        startTime = _startTime;
        endTime = _startTime + _duration * 1 hours;
    }

    function () payable {
        if (msg.value < 0.01 * 1 ether) throw;
        doPurchase(msg.sender);
    }

    function refund() external onlyAfter(endTime) {
        if (softCapReached) throw;
        if (refunded[msg.sender]) throw;

        uint balance = token.balanceOf(msg.sender);
        if (balance == 0) throw;

        uint refund = balance / price;
        if (refund > this.balance) {
            refund = this.balance;
        }

        if (!msg.sender.send(refund)) throw;
        refunded[msg.sender] = true;
        weiRefunded = weiRefunded.add(refund);
        Refunded(msg.sender, refund);
    }

    function withdraw() onlyOwner {
        if (!softCapReached) throw;
        if (!beneficiary.send(collected)) throw;
        token.transfer(beneficiary, token.balanceOf(this));
        crowdsaleFinished = true;
    }

    function doPurchase(address _owner) private onlyAfter(startTime) onlyBefore(endTime) {

        assert(crowdsaleFinished == false);
        if (collected.add(msg.value) > hardCap) throw;

        if (!softCapReached && collected < softCap && collected.add(msg.value) >= softCap) {
            softCapReached = true;
            SoftCapReached(softCap);
        }
        uint tokens = msg.value * price;
        if (token.balanceOf(msg.sender) + tokens > purchaseLimit) throw;

        if (token.balanceOf(msg.sender) == 0) investorCount++;

        collected = collected.add(msg.value);

        token.transfer(msg.sender, tokens);

        weiRaised = weiRaised.add(msg.value);
        tokensSold = tokensSold.add(tokens);

        NewContribution(_owner, tokens, msg.value);

        if (collected == hardCap) {
            GoalReached(hardCap);
        }
    }
}
