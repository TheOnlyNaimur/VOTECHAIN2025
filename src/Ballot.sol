// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 1. HARD IMPORTS: Bringing in the full blueprints
import "./UserRegistry.sol";
import "./PartyRegistry.sol";

contract Ballot {
    // 2. We use the actual Contract Names as types
    UserRegistry public userRegistry;
    PartyRegistry public partyRegistry;

    mapping(address => bool) public hasVoted; // voter address => voted or not
    mapping(address => uint256) public voteCount; // party address => votes

    event VoteCast(address indexed voter, address indexed party);

    // 3. The constructor still takes the addresses from deployment
    constructor(address _userReg, address _partyReg) {
        // We tell Solidity: "Treat these addresses as these specific contracts"
        userRegistry = UserRegistry(_userReg);
        partyRegistry = PartyRegistry(_partyReg);
    }

    function vote(address _partyAddress) public {
        // 4. We can now call functions directly from the imported contracts
        require(userRegistry.isApproved(msg.sender), "Voter not approved");
        require(partyRegistry.isApproved(_partyAddress), "Party not approved");
        require(!hasVoted[msg.sender], "Already voted");

        voteCount[_partyAddress] += 1;
        hasVoted[msg.sender] = true;

        emit VoteCast(msg.sender, _partyAddress);
    }
}
