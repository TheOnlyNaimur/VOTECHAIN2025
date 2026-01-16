// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserRegistry {

    enum Status { None, Pending, Approved, Rejected }
    
    
    struct User { 
      string name; 
      string email;
      string phone;
      string nid;
      Status status; 
  }

    address public admin; //sets the deployer as admin. it works only one time when the contract is deployed the msg.sender becomes admin
    mapping(address => User) public users; // here address is the metsmasks address of the user

    event UserRegistrationRequested(address indexed userAddress, string name, string nid);

    constructor() { admin = msg.sender; }

    function registerAsVoter(address _voterAddress, string memory _name, string memory _email, string memory _phone, string memory _nid) public {
        require(msg.sender == admin, "Only Admin can register voters");
        require(users[_voterAddress].status == Status.None, "Already registered");
        users[_voterAddress] = User(_name, _email, _phone, _nid, Status.Approved); // Directly approved
        emit UserRegistrationRequested(_voterAddress, _name, _nid);
    }

    function approveUser(address _voter) public {
        require(msg.sender == admin, "Only Admin");
        users[_voter].status = Status.Approved;
    }

    function isApproved(address _voter) public view returns (bool) {
        return users[_voter].status == Status.Approved;
    }
}