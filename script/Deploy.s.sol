// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {UserRegistry} from "../src/UserRegistry.sol";
import {PartyRegistry} from "../src/PartyRegistry.sol";
import {Ballot} from "../src/Ballot.sol";

contract DeployVotingSystem is Script {
    function run() external {
        // 1. Retrieve the private key for the deployer (Account 0)
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // 2. Start recording transactions to the blockchain
        vm.startBroadcast(deployerPrivateKey);

        // 3. Deploy UserRegistry
        UserRegistry userReg = new UserRegistry();

        // 4. Deploy PartyRegistry
        PartyRegistry partyReg = new PartyRegistry();

        // 5. Deploy Ballot, passing the addresses of the two registries
        new Ballot(address(userReg), address(partyReg));

        // 6. Stop recording
        vm.stopBroadcast();
    }
}
