// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Test} from "forge-std/Test.sol";
import {Votium} from "../src/Votium.sol";

contract VotiumTest is Test {
    Votium voteContract;

    address owner = address(0x1);
    address person1 = address(0x2);
    address person2 = address(0x3);

    function setUp() public {
        vm.prank(owner);
        voteContract = new Votium();
    }

    // DEPLOYMENT
    function testOwner() public view {
        assertEq(voteContract.owner(), owner);
    }

    function testInitialCountersAreZero() public view {
        assertEq(voteContract.totalElectionIds(), 0);
    }

    //CREATE ELECTIONS
    function testCreate() public {
        string[] memory candidates = new string[](2);
        candidates[0] = "person1";
        candidates[1] = "person2";

        vm.prank(person1);
        voteContract.createElection(
            "Election 1",
            "This first demo election",
            "ex:img:1",
            candidates,
            10
        );

        Votium.ElectionView memory e = voteContract.getElectionById(1);

        assertEq(voteContract.totalElectionIds(), 1);

        assertEq(e.name, "Election 1");
        assertEq(e.description, "This first demo election");
        assertEq(e.image, "ex:img:1");
        assertEq(e.cancelled, false);
        assertEq(e.totalVotes, 0);
        assertEq(e.candidates.length, 2);
        assertEq(e.candidates[0].name, "person1");
        assertEq(e.candidates[1].name, "person2");
        assertEq(e.candidates[0].voteCount, 0);
        assertEq(e.candidates[1].voteCount, 0);
        assertEq(e.endTimestamp > block.timestamp, true);
    }

    function createElectionInputsValidations() public {
        vm.prank(person1);

        string;
        candidates[0] = "Alice";
        candidates[1] = "Bob";

        // empty name
        vm.expectRevert(Votium.InvalidNameLength.selector);
        voteContract.createElection(
            "",
            "Valid description",
            "img",
            candidates,
            10
        );

        // name > 30 chars
        string memory longName = "abcdefghijklmnopqrstuvwxyz123456"; // 32 chars
        vm.expectRevert(Votium.InvalidNameLength.selector);
        voteContract.createElection(
            longName,
            "Valid description",
            "img",
            candidates,
            10
        );

        vm.expectRevert(Votium.InvalidDescriptionLength.selector);
        voteContract.createElection("Election", "", "img", candidates, 10);

        string memory longDesc = string(new bytes(201));
        vm.expectRevert(Votium.InvalidDescriptionLength.selector);
        voteContract.createElection(
            "Election",
            longDesc,
            "img",
            candidates,
            10
        );

        vm.expectRevert(Votium.InvalidImageLength.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "",
            candidates,
            10
        );

        // 0 candidates
        string;
        vm.expectRevert(Votium.InvalidCandidateCount.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            zeroCandidates,
            10
        );

        // 1 candidate
        string;
        oneCandidate[0] = "OnlyOne";
        vm.expectRevert(Votium.InvalidCandidateCount.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            oneCandidate,
            10
        );

        // > MAX_CANDIDATES (7)
        string;
        for (uint256 i = 0; i < 7; i++) {
            manyCandidates[i] = string(abi.encodePacked("C", i));
        }
        vm.expectRevert(Votium.InvalidCandidateCount.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            manyCandidates,
            10
        );

        string;
        emptyCandidateName[0] = "";
        emptyCandidateName[1] = "Bob";

        vm.expectRevert(Votium.EmptyCandidateName.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            emptyCandidateName,
            10
        );

        string;
        duplicateCandidates[0] = "Alice";
        duplicateCandidates[1] = "Alice";

        vm.expectRevert(Votium.DuplicateCandidateNames.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            duplicateCandidates,
            10
        );

        vm.expectRevert(Votium.DeadlineMustBeInFuture.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            candidates,
            0
        );

        vm.stopPrank();
        vm.prank(owner);
        voteContract.pause();

        vm.prank(person1);
        vm.expectRevert("Pausable: paused");
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            candidates,
            10
        );
    }

    function cancelElection() public {
    string;
    candidates[0] = "Alice";
    candidates[1] = "Bob";

    vm.prank(person1);
    voteContract.createElection(
        "Election",
        "Valid description",
        "img",
        candidates,
        10
    );

    // ---------- ELECTION NOT FOUND ----------
    vm.prank(person1);
    vm.expectRevert(Votium.ElectionNotFound.selector);
    voteContract.cancelElection(999);

    // ---------- NOT ELECTION CREATOR ----------
    vm.prank(person2);
    vm.expectRevert(Votium.NotElectionCreator.selector);
    voteContract.cancelElection(1);

    // ---------- ELECTION ALREADY ENDED ----------
    vm.warp(block.timestamp + 11 minutes);
    vm.prank(person1);
    vm.expectRevert(Votium.ElectionAlreadyEnded.selector);
    voteContract.cancelElection(1);

    // ---------- RESET : create another election ----------
    vm.warp(block.timestamp); // reset not needed, just create new one

    vm.prank(person1);
    voteContract.createElection(
        "Election 2",
        "Valid description",
        "img",
        candidates,
        10
    );

    // ---------- SUCCESSFUL CANCEL ----------
    vm.prank(person1);
    vm.expectEmit(true, false, false, true);
    emit Votium.ElectionCancelled(2);
    voteContract.cancelElection(2);

    // ---------- ALREADY CANCELLED ----------
    vm.prank(person1);
    vm.expectRevert(Votium.AlreadyCancelled.selector);
    voteContract.cancelElection(2);

    // ---------- PAUSED CONTRACT ----------
    vm.prank(owner);
    voteContract.pause();

    vm.prank(person1);
    vm.expectRevert("Pausable: paused");
    voteContract.cancelElection(2);
}

}
