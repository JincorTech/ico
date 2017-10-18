# Jincor ICO Contracts
![](https://travis-ci.org/JincorTech/ico.svg?branch=master)
![](https://habrastorage.org/webt/59/d5/42/59d542206afbe280817420.png)

Baked with <3 by [Jincor](https://ico.jincor.com)

## JCR token functionality
In order to further the development of the platform, reach breakeven and get to the global market as soon as possible we are going to raise extra funding by running an ICO campaign.

Jincor issued 35,000,000 JCR tokens total, most of which will be put on sale. The base cost of tokens will depend on the popularity of the platform, and their holders will be able to share the success of Jincor by getting permanent progressive income.

In the future, JCR tokens will be essential for the proper platform experience. Whereas it is free for organizations to use the basic functionality of Jincor ecosystem, some features will be available for a fee, which can be paid in JCR tokens only. These premium features include:

1. Digital verification of companies;
2. Setting up enterprise and individual cryptocurrency accounts;
3. Getting access to a range of financial instruments, such as bills of credit, colls, overdrafts, factoring and etc.;

Using a construction set for creating and execution of corporate smart contracts (based on labour, property, contractual and other relations);

Appealing to a decentralized arbitration system for litigation within the digital jurisdiction.
To sum up, JCR tokens will serve as a local digital currency, which can be used for paying Jincor fees and mutual corporate payments, just like any other popular cryptocurrency.

JCR token is developed on Ethereum’s blockchain and conform to the ERC20 Token Standard.

Important notes:

1. JCR tokens will be sent automatically back to the wallet from which the funds have been sent.
2. JCR tokens transactions will be limited till ICO end to prevent trading before the ICO ends.
3. During the pre-ICO ETH is accepted only from wallets compliant with ERC-20 token standard. (recommended to use: MyEtherWallet). Do not send ETH directly from cryptocurrency exchanges (Coinbase, Kraken, Poloniex etc.)!
4. We'll send back all ETH in case of minimal cap is not collected.

## How to setup development environment and run tests?

1. Install `docker` if you don't have it.
1. Clone this repo.
1. Run `docker-compose build --no-cache`.
1. Run `docker-compose up -d`. 
You should wait a bit until Oraclize ethereum-bridge initialize. Wait for 
`Please add this line to your contract constructor:
OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);`
message to appear. To check for it run `docker logs ico_oracle_1`.
1. Install dependencies: `docker-compose exec workspace yarn`.
1. To run tests: `docker-compose exec workspace truffle test`.
