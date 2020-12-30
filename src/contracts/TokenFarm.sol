pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {

    string public name = "Dapp Token Farm"; // State variable, stored on the blockchain
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;
    bool internal locked;
    

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // 1. Stakes Tokens (deposit)
    function stakeTokens(uint _amount) public {

        require(_amount > 0, "amount must be greater than 0");

        // Transfer Dai to this contact for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to stakers array only if they havent staked already
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    modifier noRentrancy() {
        require(!locked, "no rentrancy!");
        locked = true;
        _;
        locked = false;
    }

    // 2. Unstaking Tokens (withdraw)
    function unstakeTokens() public noRentrancy {
        // Fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // Require balance ot be greater than 0
        require(balance > 0, "amount must be greater than 0");

        // Transfer dai tokens to this contract for staking
        daiToken.transfer(msg.sender, balance);

        // Reset staking balance
        stakingBalance[msg.sender] = 0;

        // Update staking status
        isStaking[msg.sender] = false;
    }

    // 3. Issuing Tokens (interest)
    function issueTokens() public isOwner() {
        // Issue tokens to all stakers
        for(uint i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                dappToken.transfer(recipient, balance);
            }  
        }
    }

    modifier isOwner() {
        // Owner can be the only one who calls the function
        require(msg.sender == owner, "caller must be the owner");
        _;
    }

}