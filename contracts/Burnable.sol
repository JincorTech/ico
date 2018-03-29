pragma solidity ^0.4.11;
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

/**
 * @title Burnable
 *
 * @dev Standard ERC20 token
 */
contract Burnable is StandardToken {
  using SafeMath for uint;

  /* This notifies clients about the amount burnt */
  event Burn(address indexed from, uint value);

  function burn(uint _value) returns (bool success) {
    require(_value > 0 && balances[msg.sender] >= _value);
    balances[msg.sender] = balances[msg.sender].sub(_value);
    totalSupply_ = totalSupply_.sub(_value);
    Burn(msg.sender, _value);
    return true;
  }

  function burnFrom(address _from, uint _value) returns (bool success) {
    require(_from != 0x0 && _value > 0 && balances[_from] >= _value);
    require(_value <= allowed[_from][msg.sender]);
    balances[_from] = balances[_from].sub(_value);
    totalSupply_ = totalSupply_.sub(_value);
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
