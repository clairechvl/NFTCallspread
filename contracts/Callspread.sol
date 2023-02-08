//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4; 

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Callspread is ERC721 {

    uint256 public tokenCounter;
    AggregatorV3Interface internal priceFeed;

    /**
     * Network: Mumbai
     * Aggregator: EUR/USD
     * Address: 0x7d7356bF6Ee5CDeC22B216581E48eCC700D0497A
     */
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        tokenCounter = 0;
        priceFeed = AggregatorV3Interface(
            0x7d7356bF6Ee5CDeC22B216581E48eCC700D0497A
        );
    }

    /**
     * Returns the latest price.
     */
    function expireOption() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

 

    

}