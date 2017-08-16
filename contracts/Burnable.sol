pragma solidity ^0.4.11;
import "zeppelin-solidity/contracts/token/StandardToken.sol";

/**
 * @title Burnable
 *
 * @dev Standard ERC20 token
 */
contract Burnable is StandardToken {
  /* This notifies clients about the amount burnt */
  event Burn(address indexed from, uint256 value);

  function burn(uint256 _value) returns (bool success) {
    if (balances[msg.sender] < _value) throw;            // Check if the sender has enough
    balances[msg.sender] -= _value;                      // Subtract from the sender
    totalSupply -= _value;                                // Updates totalSupply
    Burn(msg.sender, _value);
    return true;
  }

  function burnFrom(address _from, uint256 _value) returns (bool success) {
    if (balances[_from] < _value) throw;                // Check if the sender has enough
    if (_value > allowed[_from][msg.sender]) throw;    // Check allowance
    balances[_from] -= _value;                          // Subtract from the sender
    totalSupply -= _value;                               // Updates totalSupply
    allowed[_from][msg.sender] -= _value;
    Burn(_from, _value);
    return true;
  }

  function transfer(address _to, uint _value) returns (bool success) {
    if (_to == 0x0) throw; //use burn

    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint _value) returns (bool success) {
    if (_to == 0x0) throw; //use burn

    return super.transferFrom(_from, _to, _value);
  }
}
