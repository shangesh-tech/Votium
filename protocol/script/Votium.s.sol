// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {Votium} from "../src/Votium.sol";
import {console} from "forge-std/console.sol";

contract DeployWeb3Portfolio is Script {
    Votium public votium;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        votium = new Votium();
        console.log("Votium:", address(votium));
        
        vm.stopBroadcast();
    }
}
