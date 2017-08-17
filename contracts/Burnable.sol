pragma solidity ^0.4.11;
import "zeppelin-solidity/contracts/token/StandardToken.sol";

/**
 * @title Burnable
 *
 * @dev Standard ERC20 token
 */
contract Burnable is StandardToken {
  using SafeMath for uint;

  /* This notifies clients about the amount burnt */
  event Burn(address indexed from, uint256 value);

  function burn(uint256 _value) returns (bool success) {
    require(balances[msg.sender] >= _value);                // Check if the sender has enough
    balances[msg.sender] = balances[msg.sender].sub(_value);// Subtract from the sender
    totalSupply = totalSupply.sub(_value);                                  // Updates totalSupply
    Burn(msg.sender, _value);
    return true;
  }

  function burnFrom(address _from, uint256 _value) returns (bool success) {
    require(balances[_from] >= _value);               // Check if the sender has enough
    require(_value <= allowed[_from][msg.sender]);    // Check allowance
    balances[_from] = balances[_from].sub(_value);    // Subtract from the sender
    totalSupply = totalSupply.sub(_value);            // Updates totalSupply
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    Burn(_from, _value);
    return true;
  }

  function transfer(address _to, uint _value) returns (bool success) {
    require(_to != 0x0); //use burn

    return super.transfer(_to, _value);
  }

  function transferFrom(address _from, address _to, uint _value) returns (bool success) {
    require(_to != 0x0); //use burn

    return super.transferFrom(_from, _to, _value);
  }
}
