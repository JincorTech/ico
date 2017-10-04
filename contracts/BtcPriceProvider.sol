pragma solidity ^0.4.0;
import "./abstract/PriceProvider.sol";

contract BtcPriceProvider is PriceProvider {
  function BtcPriceProvider() PriceProvider("json(https://api.kraken.com/0/public/Ticker?pair=XBTUSD).result.XXBTZUSD.c.0") {

  }

  function notifyWatcher() private {
    watcher.receiveBtcPrice(currentPrice);
  }
}
