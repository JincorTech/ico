pragma solidity ^0.4.0;


import "zeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol";


contract PaymentGateway {

  /**
   * Payment gateway agent.
   */
  address internal paymentGatewayAgent;

  /**
   * Mapping for: GatewayId -> TransactionId -> BueryId -> TokensAmount
   */
  mapping(bytes6 => mapping(bytes32 => mapping(address => uint) )) private gatewaysPaymentTransfers;

  event PaymentGatewayTransfer(bytes6 indexed gatewayId, bytes32 indexed transactionId, address indexed to);

  /**
   * Transfer tokens.
   */
  function transferWithPaymentGatewayInternal(ERC20Basic token, bytes6 gatewayId, bytes32 transactionId, address to, uint tokensAmount) internal returns (bool) {
    require(tokensAmount != 0);
    require(to != address(0) && msg.sender == paymentGatewayAgent);
    require(gatewaysPaymentTransfers[gatewayId][transactionId][to] == 0);

    gatewaysPaymentTransfers[gatewayId][transactionId][to] = tokensAmount;

    token.transfer(to, tokensAmount);

    PaymentGatewayTransfer(gatewayId, transactionId, to);

    return true;
  }

  /**
   * Get transfered tokens amount.
   */
  function getTokensAmountByPaymentGateway(bytes6 gatewayId, bytes32 transactionId, address to) constant external returns (uint) {
    require(gatewaysPaymentTransfers[gatewayId][transactionId][to] != 0); // for revert when to is uknown
    return gatewaysPaymentTransfers[gatewayId][transactionId][to];
  }

}
