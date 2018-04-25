# Change Log

## [Unreleased](https://github.com/JincorTech/ico/tree/HEAD)

[Full Changelog](https://github.com/JincorTech/ico/compare/1.0.0...HEAD)

**Implemented enhancements:**

- Concerns around using a centralised oracle for setting ETH/USD exchange rate [\#48](https://github.com/JincorTech/ico/issues/48)
- Issues with calculateBonus\(\) method [\#45](https://github.com/JincorTech/ico/issues/45)
- Sol Merger [\#44](https://github.com/JincorTech/ico/issues/44)
- Avoid `send` [\#36](https://github.com/JincorTech/ico/issues/36)
- Migrations code duplication [\#35](https://github.com/JincorTech/ico/issues/35)
- Disable ownership transfer during crowdsale [\#34](https://github.com/JincorTech/ico/issues/34)
- Assert vs Requiree [\#33](https://github.com/JincorTech/ico/issues/33)
- Token decimals data type [\#32](https://github.com/JincorTech/ico/issues/32)
- Argument correctness checks [\#30](https://github.com/JincorTech/ico/issues/30)
- Function access levels\(!\) [\#29](https://github.com/JincorTech/ico/issues/29)
- Constant functions [\#28](https://github.com/JincorTech/ico/issues/28)
- Using constants [\#27](https://github.com/JincorTech/ico/issues/27)
- Integrate BTCRelay to receive investments in BTC. [\#18](https://github.com/JincorTech/ico/issues/18)
- Add separate contract which gets ETH and BTC USD price from oracle. [\#16](https://github.com/JincorTech/ico/issues/16)
- Rare chance to send GoalReached event [\#10](https://github.com/JincorTech/ico/issues/10)
- Saving gas in the most common operation [\#9](https://github.com/JincorTech/ico/issues/9)

**Closed issues:**

- Refactor whitelist. Referrals should be added separately from whitelist. [\#57](https://github.com/JincorTech/ico/issues/57)
- Referral bonus is counted towards reaching softcap/hardcap even if nobody receives it [\#53](https://github.com/JincorTech/ico/issues/53)
- Owners can prevent withdrawals by halting + Several others [\#52](https://github.com/JincorTech/ico/issues/52)
- Modifier canTransfer\(\) in JincorToken.sol [\#51](https://github.com/JincorTech/ico/issues/51)
- Constant functions in InvestorWhiteList.sol  [\#50](https://github.com/JincorTech/ico/issues/50)
- Multiple issues in refund function [\#46](https://github.com/JincorTech/ico/issues/46)
- Withdraw tokens, deposited on contract address [\#42](https://github.com/JincorTech/ico/issues/42)
- Add separate contract handling investor/referral whitelist. [\#41](https://github.com/JincorTech/ico/issues/41)
- Short address attack prevention [\#39](https://github.com/JincorTech/ico/issues/39)
- Use direct variable declarations in test instead of this.crowdsale etc. [\#24](https://github.com/JincorTech/ico/issues/24)
- Use uint everywhere as uint is alias for uint256. [\#22](https://github.com/JincorTech/ico/issues/22)
- Add referral bonus for less than 500 ETH invesments. [\#19](https://github.com/JincorTech/ico/issues/19)
- Implement first version of ICO contract with referral and high volume bonuses. [\#14](https://github.com/JincorTech/ico/issues/14)
- Fix Presale contract constructor params and tests. [\#11](https://github.com/JincorTech/ico/issues/11)

**Merged pull requests:**

- Closes \#45 \#48 \#52 \#56 \#57. \(\#58\) [\#59](https://github.com/JincorTech/ico/pull/59) ([artemii235](https://github.com/artemii235))
- Closes \#45 \#48 \#52 \#56 \#57. [\#58](https://github.com/JincorTech/ico/pull/58) ([artemii235](https://github.com/artemii235))
- Closes \#53 \#44 \#46 \#50. \(\#54\) [\#55](https://github.com/JincorTech/ico/pull/55) ([artemii235](https://github.com/artemii235))
- Closes \#53 \#44 \#46 \#50. [\#54](https://github.com/JincorTech/ico/pull/54) ([artemii235](https://github.com/artemii235))
- Develop [\#49](https://github.com/JincorTech/ico/pull/49) ([hlogeon](https://github.com/hlogeon))
- Closes \#41 \#36 \#35 \#34 \#33 \#32 \#30 \#29 \#28 \#27 \#22. [\#43](https://github.com/JincorTech/ico/pull/43) ([artemii235](https://github.com/artemii235))
- Develop [\#21](https://github.com/JincorTech/ico/pull/21) ([hlogeon](https://github.com/hlogeon))
- Closes \#19. Add referral bonuses for 100-249 and 250-499 investments. [\#20](https://github.com/JincorTech/ico/pull/20) ([artemii235](https://github.com/artemii235))
- Closes \#16. Add oracles for BTC and ETH prices in USD updates. [\#17](https://github.com/JincorTech/ico/pull/17) ([artemii235](https://github.com/artemii235))
- Closes \#14. ICO contract v1. Referral and high investments bonus. [\#15](https://github.com/JincorTech/ico/pull/15) ([artemii235](https://github.com/artemii235))
- Closes \#9. Closes \#10. Remove GoalReached. Refactor canTransfer. [\#13](https://github.com/JincorTech/ico/pull/13) ([artemii235](https://github.com/artemii235))
- Fix Presale contract constructor params and tests. [\#12](https://github.com/JincorTech/ico/pull/12) ([artemii235](https://github.com/artemii235))

## [1.0.0](https://github.com/JincorTech/ico/tree/1.0.0) (2017-08-17)
**Implemented enhancements:**

- Tests for contracts [\#1](https://github.com/JincorTech/ico/issues/1)

**Closed issues:**

- Make JincorToken burnable to burn not sold value. [\#7](https://github.com/JincorTech/ico/issues/7)
- Make pre sale contract Haltable. Add tests. [\#5](https://github.com/JincorTech/ico/issues/5)

**Merged pull requests:**

- Closes \#7. Make JincorToken burnable. [\#8](https://github.com/JincorTech/ico/pull/8) ([artemii235](https://github.com/artemii235))
- Closes \#5. Make pre sale contract Haltable. [\#6](https://github.com/JincorTech/ico/pull/6) ([artemii235](https://github.com/artemii235))
- Add tests for pre sale contract. [\#4](https://github.com/JincorTech/ico/pull/4) ([artemii235](https://github.com/artemii235))
- Feature/team multi sig [\#3](https://github.com/JincorTech/ico/pull/3) ([hlogeon](https://github.com/hlogeon))
- Closes \#1. Add tests for JincorToken. Fix min contribution for presale. [\#2](https://github.com/JincorTech/ico/pull/2) ([artemii235](https://github.com/artemii235))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*