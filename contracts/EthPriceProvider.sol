pragma solidity ^0.4.0;
import "./abstract/PriceProvider.sol";

contract EthPriceProvider is PriceProvider {
  function EthPriceProvider() PriceProvider("json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0") {

  }

  function notifyWatcher() private {
    watcher.receiveEthPrice(currentPrice);
  }
}
