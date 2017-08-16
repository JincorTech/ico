pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/*
 * Haltable
 *
 * Abstract contract that allows children to implement an
 * emergency stop mechanism. Differs from Pausable by causing a throw when in halt mode.
 *
 *
 * Originally envisioned in FirstBlood ICO contract.
 */
contract Haltable is Ownable {
  bool public halted;

  modifier inNormalState {
    assert(!halted);
    _;
  }

  modifier inEmergencyState {
    assert(halted);
    _;
  }

  // called by the owner on emergency, triggers stopped state
  function halt() external onlyOwner inNormalState {
    halted = true;
  }

  // called by the owner on end of emergency, returns to normal state
  function unhalt() external onlyOwner inEmergencyState {
    halted = false;
  }

}
