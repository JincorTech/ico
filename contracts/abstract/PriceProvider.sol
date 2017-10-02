pragma solidity ^0.4.0;
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../usingOraclize.sol";
import "./PriceReceiver.sol";

contract PriceProvider is Ownable, usingOraclize {
  enum State { Stopped, Active }

  uint public updateInterval = 7200; //2 hours by default

  uint public currentPrice;

  string public url;

  mapping (bytes32 => bool) validIds;

  PriceReceiver public watcher;

  State public state = State.Stopped;

  function notifyWatcher() private;

  modifier inActiveState() {
    require(state == State.Active);
    _;
  }

  modifier inStoppedState() {
    require(state == State.Stopped);
    _;
  }

  function PriceProvider(string _url) {
    url = _url;

    //update immediately first time to be sure everything is working - first oraclize request is free.
    update(0);
  }

  //send some funds along with the call to cover oraclize fees
  function startUpdate() payable onlyOwner inStoppedState {
    state = State.Active;
    update(updateInterval);
  }

  function stopUpdate() external onlyOwner inActiveState {
    state = State.Stopped;
  }

  function setWatcher(address newWatcher) external onlyOwner {
    require(newWatcher != 0x0);
    watcher = PriceReceiver(newWatcher);
  }

  function setUpdateInterval(uint newInterval) external onlyOwner {
    require(newInterval > 0);
    updateInterval = newInterval;
  }

  function setUrl(string newUrl) external onlyOwner {
    require(bytes(newUrl).length > 0);
    url = newUrl;
  }

  function __callback(bytes32 myid, string result, bytes proof) {
    require(msg.sender == oraclize_cbAddress() && validIds[myid]);
    currentPrice = parseInt(result, 2);
    assert(currentPrice > 0);
    if (state == State.Active) {
      notifyWatcher();
      update(updateInterval);
    }
    delete validIds[myid];
  }

  function update(uint delay) private {
    if (oraclize_getPrice("URL") > this.balance) {
      //stop if we don't have enough funds anymore
      state = State.Stopped;
    } else {
      bytes32 queryId = oraclize_query(delay, "URL", url);
      validIds[queryId] = true;
    }
  }

  //we need to get back our funds if we don't need this oracle anymore
  function withdraw(address receiver) external onlyOwner inStoppedState {
    require(receiver != 0x0);
    require(receiver.send(this.balance));
  }
}
