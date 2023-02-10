//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4; 

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/// Insufficient balance for transfer. Needed `required` but only
/// `available` available.
/// @param available balance available.
/// @param required requested amount to transfer.
error InsufficientBalance(uint256 available, uint256 required);

contract Callspread is ERC721, ChainlinkClient {
    using Chainlink for Chainlink.Request;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    AggregatorV3Interface internal priceFeed;

    uint256 oraclePayment;

    struct Option {
        address buyer_address;
        address seller_address;
        int lower_strike;
        int higher_strike;
        uint option_expiry;
        int option_multiplier;
        int option_premium;
        uint tokenId;
    }

    uint numOptions;
    mapping (uint => Option) options;

    /**
     * Network: Mumbai
     * Aggregator: EUR/USD
     * Address: 0x7d7356bF6Ee5CDeC22B216581E48eCC700D0497A
     */
    constructor() 
    ERC721("Call spread","CSCEUR") {
        priceFeed = AggregatorV3Interface(
            0x7d7356bF6Ee5CDeC22B216581E48eCC700D0497A
        );
        oraclePayment = (1 * LINK_DIVISIBILITY) / 10; // 0,1*10**18 LINK
    }

    function mint(address buyer_address , address seller_address, uint option_expiry, int option_premium, int option_multiplier, int lower_strike, int higher_strike) public {
        _safeMint(buyer_address, _tokenIds.current());
        newOption(buyer_address, seller_address, option_expiry, option_premium, option_multiplier, lower_strike, higher_strike);
        _tokenIds.increment();
        numOptions++;
    }

    /**
     * Create Chainlink request and calls expireOption
     */
    function newOption(address buyer_address, address seller_address, uint option_expiry, int option_premium, int option_multiplier, int lower_strike, int higher_strike) private returns (uint optionId) {
        // initiate Option storage of options
        optionId = numOptions;
        Option storage o = options[optionId];
        o.buyer_address = buyer_address;
        o.seller_address = seller_address;
        o.lower_strike = lower_strike;
        o.higher_strike = higher_strike;
        o.option_expiry = option_expiry;
        o.option_multiplier = option_multiplier;
        o.option_premium = option_premium;
        o.tokenId = _tokenIds.current();
        // ChainLink request
        Chainlink.Request memory req = buildChainlinkRequest('ca98366cc7314957b8c012c72f05aeeb', address(this), this.expireOption.selector);
        req.add(
            'get',
            'https://worldtimeapi.org/api/timezone/etc/UTC'
        );
        req.add('path', 'unixtime');
        sendChainlinkRequestTo(0x40193c8518BB267228Fc409a613bDbD8eC5a97b3,req,oraclePayment); 
    }

    /**
     * Compute collateral and if there's enough funds, compute payoff and proceed to multiple transfer if necessary
     */
    function expireOption(bytes32 _requestId) public 
        recordChainlinkFulfillment(_requestId){
        Option memory o = getOption(numOptions);

        uint collateral = uint( (o.option_multiplier * (o.higher_strike - o.lower_strike)) / 10000 );
        address ceur = 0xfE1795Ec64De0e6f5674d043E433Ce5a141E5e9A;
        uint buyer_premium = uint( (o.option_premium * o.option_multiplier) / 10000 );
        // check if buyer can pay for options he's buying, else throw InsufficientBalance
        if(IERC20(ceur).approve(o.buyer_address, buyer_premium)){
            // check if collateral can be approved proceed, else throw InsufficientBalance
            if(IERC20(ceur).approve(o.seller_address, collateral)){
                
                // transfer fees from buyer to seller
                IERC20(ceur).transferFrom(o.buyer_address, o.seller_address, buyer_premium);

                // get EUR/USD value by calling expireOption()
                (
                /* uint80 roundID */,
                int price,
                /*uint startedAt*/,
                /*uint timeStamp*/,
                /*uint80 answeredInRound*/
                ) = priceFeed.latestRoundData();
                uint payoff = 0;

                // converting input values to the format of price (* 1000000)
                int higher_strike = o.higher_strike * 1000000;
                int lower_strike = o.lower_strike * 1000000;
                int option_premium = o.option_premium * 1000000;

                // if price between higher_strike and lower_strike it's a profit situation for the buyer
                if((price <= higher_strike) && (price >= lower_strike)){
                    payoff = uint( (price - lower_strike - option_premium) * o.option_multiplier );
                }

                // if price greater than higher_strike then it's a max gain situation for the buyer
                if(price > higher_strike){
                    payoff = uint( (higher_strike - lower_strike - option_premium) * o.option_multiplier );
                }

                // if a payoff has been computed then transfer funds to buyer_address
                if(payoff != 0){

                // convert payoff back to real format (/ 100000000)
                payoff = payoff / 100000000;

                // transfer profits from seller to buyer
                IERC20(ceur).transferFrom(o.seller_address, o.buyer_address, payoff);
                }

            }else{

                revert InsufficientBalance({
                    available: IERC20(ceur).balanceOf(o.seller_address),
                    required: collateral
                });
            }
        }else{

            revert InsufficientBalance({
                available: IERC20(ceur).balanceOf(o.buyer_address),
                required: buyer_premium
            });
        }
    }

    /**
     * Get an option for a given token.
     */
    function getOption(uint256 _tokenId) public view virtual returns(Option memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: ID of nonexistent token"
        );
        return options[_tokenId];
    }
}