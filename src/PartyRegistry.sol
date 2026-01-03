// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PartyRegistry {

    enum Status { None, Pending, Approved, Rejected }
    
    struct Party { 
        string partyName; 
        string regNumber; // Unique Registration ID for the Party
        Status status; 
    }

    address public admin;
    mapping(address => Party) public parties;

    // Event to notify the frontend when a new party applies
    event PartyRegistrationRequested(address indexed partyAddress, string name);

    constructor() { 
        admin = msg.sender; 
    }

    // Function for admin to register parties
    function registerAsParty(
        address _partyAddress,
        string memory _partyName, 
        string memory _regNumber      
    ) public {
        require(msg.sender == admin, "Only Admin can register parties");
        require(parties[_partyAddress].status == Status.None, "Already registered");
        
        parties[_partyAddress] = Party(_partyName, _regNumber, Status.Approved); // Directly approved
        
        emit PartyRegistrationRequested(_partyAddress, _partyName);
    }

    // Admin function to approve the party after verifying details
    function approveParty(address _party) public {
        require(msg.sender == admin, "Only Admin");
        require(parties[_party].status == Status.Pending, "No pending request");
        
        parties[_party].status = Status.Approved;
    }

    // Helper to let the Ballot contract check if this party is allowed to receive votes
    function isApproved(address _party) public view returns (bool) {
        return parties[_party].status == Status.Approved;
    }
}