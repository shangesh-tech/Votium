// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Votium} from "../src/Votium.sol";

contract VotiumTest is Test {
    Votium voteContract;

    address owner = address(0x1);
    address person1 = address(0x2);
    address person2 = address(0x3);
    address person3 = address(0x4);

    function setUp() public {
        vm.prank(owner);
        voteContract = new Votium();
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function _createValidCandidates() internal pure returns (string[] memory) {
        string[] memory candidates = new string[](2);
        candidates[0] = "Alice";
        candidates[1] = "Bob";
        return candidates;
    }

    function _createElection() internal {
        string[] memory candidates = _createValidCandidates();
        vm.prank(person1);
        voteContract.createElection(
            "Election 1",
            "This is the first demo election",
            "ipfs://image1",
            candidates,
            10
        );
    }

    // ============================================
    // DEPLOYMENT TESTS
    // ============================================

    function testOwner() public view {
        assertEq(voteContract.owner(), owner);
    }

    function testInitialCountersAreZero() public view {
        assertEq(voteContract.totalElectionIds(), 0);
    }

    function testMinCandidates() public view {
        assertEq(voteContract.MIN_CANDIDATES(), 2);
    }

    function testMaxCandidates() public view {
        assertEq(voteContract.MAX_CANDIDATES(), 6);
    }

    // ============================================
    // CREATE ELECTION TESTS
    // ============================================

    function testCreateElectionSuccess() public {
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
        assertEq(e.deadline > block.timestamp, true);
    }

    function testCreateElectionEmitsEvent() public {
        string[] memory candidates = _createValidCandidates();

        vm.prank(person1);
        vm.expectEmit(true, true, false, true);
        emit Votium.ElectionCreated(
            1,
            person1,
            "Election 1",
            "Valid description",
            "img",
            block.timestamp + 10 minutes
        );
        voteContract.createElection(
            "Election 1",
            "Valid description",
            "img",
            candidates,
            10
        );
    }

    function testCreateElectionWithMaxCandidates() public {
        string[] memory candidates = new string[](6);
        candidates[0] = "Alice";
        candidates[1] = "Bob";
        candidates[2] = "Charlie";
        candidates[3] = "David";
        candidates[4] = "Eve";
        candidates[5] = "Frank";

        vm.prank(person1);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            candidates,
            10
        );

        assertEq(voteContract.totalElectionIds(), 1);
    }

    function testCreateElectionRevertsEmptyName() public {
        string[] memory candidates = _createValidCandidates();

        vm.prank(person1);
        vm.expectRevert(Votium.InvalidNameLength.selector);
        voteContract.createElection(
            "",
            "Valid description",
            "img",
            candidates,
            10
        );
    }

    function testCreateElectionRevertsNameTooLong() public {
        string[] memory candidates = _createValidCandidates();
        string memory longName = "abcdefghijklmnopqrstuvwxyz123456"; // 32 chars

        vm.prank(person1);
        vm.expectRevert(Votium.InvalidNameLength.selector);
        voteContract.createElection(
            longName,
            "Valid description",
            "img",
            candidates,
            10
        );
    }

    function testCreateElectionRevertsEmptyDescription() public {
        string[] memory candidates = _createValidCandidates();

        vm.prank(person1);
        vm.expectRevert(Votium.InvalidDescriptionLength.selector);
        voteContract.createElection("Election", "", "img", candidates, 10);
    }

    function testCreateElectionRevertsDescriptionTooLong() public {
        string[] memory candidates = _createValidCandidates();
        
        // Create a string longer than 200 chars
        bytes memory longDescBytes = new bytes(201);
        for (uint256 i = 0; i < 201; i++) {
            longDescBytes[i] = "a";
        }
        string memory longDesc = string(longDescBytes);

        vm.prank(person1);
        vm.expectRevert(Votium.InvalidDescriptionLength.selector);
        voteContract.createElection(
            "Election",
            longDesc,
            "img",
            candidates,
            10
        );
    }

    function testCreateElectionRevertsEmptyImage() public {
        string[] memory candidates = _createValidCandidates();

        vm.prank(person1);
        vm.expectRevert(Votium.InvalidImageLength.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "",
            candidates,
            10
        );
    }

    function testCreateElectionRevertsZeroCandidates() public {
        string[] memory zeroCandidates = new string[](0);

        vm.prank(person1);
        vm.expectRevert(Votium.InvalidCandidateCount.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            zeroCandidates,
            10
        );
    }

    function testCreateElectionRevertsOneCandidate() public {
        string[] memory oneCandidate = new string[](1);
        oneCandidate[0] = "OnlyOne";

        vm.prank(person1);
        vm.expectRevert(Votium.InvalidCandidateCount.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            oneCandidate,
            10
        );
    }

    function testCreateElectionRevertsTooManyCandidates() public {
        string[] memory manyCandidates = new string[](7);
        for (uint256 i = 0; i < 7; i++) {
            manyCandidates[i] = string(abi.encodePacked("Candidate", i));
        }

        vm.prank(person1);
        vm.expectRevert(Votium.InvalidCandidateCount.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            manyCandidates,
            10
        );
    }

    function testCreateElectionRevertsEmptyCandidateName() public {
        string[] memory emptyCandidateName = new string[](2);
        emptyCandidateName[0] = "";
        emptyCandidateName[1] = "Bob";

        vm.prank(person1);
        vm.expectRevert(Votium.EmptyCandidateName.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            emptyCandidateName,
            10
        );
    }

    function testCreateElectionRevertsDuplicateCandidates() public {
        string[] memory duplicateCandidates = new string[](2);
        duplicateCandidates[0] = "Alice";
        duplicateCandidates[1] = "Alice";

        vm.prank(person1);
        vm.expectRevert(Votium.DuplicateCandidateNames.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            duplicateCandidates,
            10
        );
    }

    function testCreateElectionRevertsZeroDeadline() public {
        string[] memory candidates = _createValidCandidates();

        vm.prank(person1);
        vm.expectRevert(Votium.DeadlineMustBeInFuture.selector);
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            candidates,
            0
        );
    }

    function testCreateElectionRevertsWhenPaused() public {
        string[] memory candidates = _createValidCandidates();

        vm.prank(owner);
        voteContract.pause();

        vm.prank(person1);
        vm.expectRevert();
        voteContract.createElection(
            "Election",
            "Valid description",
            "img",
            candidates,
            10
        );
    }

    function testCreateMultipleElections() public {
        string[] memory candidates = _createValidCandidates();

        vm.prank(person1);
        voteContract.createElection("Election 1", "Desc 1", "img1", candidates, 10);

        vm.prank(person2);
        voteContract.createElection("Election 2", "Desc 2", "img2", candidates, 20);

        assertEq(voteContract.totalElectionIds(), 2);
    }

    // ============================================
    // CANCEL ELECTION TESTS
    // ============================================

    function testCancelElectionSuccess() public {
        _createElection();

        vm.prank(person1);
        vm.expectEmit(true, false, false, true);
        emit Votium.ElectionCancelled(1);
        voteContract.cancelElection(1);

        Votium.ElectionView memory e = voteContract.getElectionById(1);
        assertEq(e.cancelled, true);
    }

    function testCancelElectionRevertsNotFound() public {
        vm.prank(person1);
        vm.expectRevert(Votium.ElectionNotFound.selector);
        voteContract.cancelElection(999);
    }

    function testCancelElectionRevertsNotCreator() public {
        _createElection();

        vm.prank(person2);
        vm.expectRevert(Votium.NotElectionCreator.selector);
        voteContract.cancelElection(1);
    }

    function testCancelElectionRevertsAlreadyEnded() public {
        _createElection();

        // Warp past the deadline
        vm.warp(block.timestamp + 11 minutes);

        vm.prank(person1);
        vm.expectRevert(Votium.ElectionAlreadyEnded.selector);
        voteContract.cancelElection(1);
    }

    function testCancelElectionRevertsAlreadyCancelled() public {
        _createElection();

        vm.prank(person1);
        voteContract.cancelElection(1);

        vm.prank(person1);
        vm.expectRevert(Votium.AlreadyCancelled.selector);
        voteContract.cancelElection(1);
    }

    function testCancelElectionRevertsWhenPaused() public {
        _createElection();

        vm.prank(owner);
        voteContract.pause();

        vm.prank(person1);
        vm.expectRevert();
        voteContract.cancelElection(1);
    }

    // ============================================
    // VOTE TESTS
    // ============================================

    function testVoteSuccess() public {
        _createElection();

        vm.prank(person2);
        vm.expectEmit(true, true, true, true);
        emit Votium.VoteSubmitted(1, person2, 1);
        voteContract.vote(1, 1);

        Votium.ElectionView memory e = voteContract.getElectionById(1);
        assertEq(e.totalVotes, 1);
    }

    function testVoteMultipleVoters() public {
        _createElection();

        vm.prank(person1);
        voteContract.vote(1, 1);

        vm.prank(person2);
        voteContract.vote(1, 2);

        vm.prank(person3);
        voteContract.vote(1, 1);

        Votium.ElectionView memory e = voteContract.getElectionById(1);
        assertEq(e.totalVotes, 3);
    }

    function testVoteRevertsElectionNotFound() public {
        vm.prank(person1);
        vm.expectRevert(Votium.ElectionNotFound.selector);
        voteContract.vote(999, 1);
    }

    function testVoteRevertsElectionCancelled() public {
        _createElection();

        vm.prank(person1);
        voteContract.cancelElection(1);

        vm.prank(person2);
        vm.expectRevert(Votium.ElectionIsCancelled.selector);
        voteContract.vote(1, 1);
    }

    function testVoteRevertsAlreadyVoted() public {
        _createElection();

        vm.prank(person2);
        voteContract.vote(1, 1);

        vm.prank(person2);
        vm.expectRevert(Votium.AlreadyVoted.selector);
        voteContract.vote(1, 2);
    }

    function testVoteRevertsElectionEnded() public {
        _createElection();

        vm.warp(block.timestamp + 11 minutes);

        vm.prank(person2);
        vm.expectRevert(Votium.ElectionEnded.selector);
        voteContract.vote(1, 1);
    }

    function testVoteRevertsInvalidCandidateIdZero() public {
        _createElection();

        vm.prank(person2);
        vm.expectRevert(Votium.InvalidCandidateId.selector);
        voteContract.vote(1, 0);
    }

    function testVoteRevertsInvalidCandidateIdTooHigh() public {
        _createElection();

        vm.prank(person2);
        vm.expectRevert(Votium.InvalidCandidateId.selector);
        voteContract.vote(1, 100);
    }

    function testVoteRevertsWhenPaused() public {
        _createElection();

        vm.prank(owner);
        voteContract.pause();

        vm.prank(person2);
        vm.expectRevert();
        voteContract.vote(1, 1);
    }

    function testHasVotedTracking() public {
        _createElection();

        // Before voting
        vm.prank(person2);
        Votium.ElectionView memory eBefore = voteContract.getElectionById(1);
        assertEq(eBefore.hasVoted, false);

        // After voting
        vm.prank(person2);
        voteContract.vote(1, 1);

        vm.prank(person2);
        Votium.ElectionView memory eAfter = voteContract.getElectionById(1);
        assertEq(eAfter.hasVoted, true);
    }

    // ============================================
    // GET ELECTIONS TESTS
    // ============================================

    function testGetElectionsEmpty() public view {
        Votium.ElectionView[] memory elections = voteContract.getElections();
        assertEq(elections.length, 0);
    }

    function testGetElectionsMultiple() public {
        string[] memory candidates = _createValidCandidates();

        vm.prank(person1);
        voteContract.createElection("Election 1", "Desc 1", "img1", candidates, 10);

        vm.prank(person2);
        voteContract.createElection("Election 2", "Desc 2", "img2", candidates, 20);

        Votium.ElectionView[] memory elections = voteContract.getElections();
        
        assertEq(elections.length, 2);
        assertEq(elections[0].name, "Election 1");
        assertEq(elections[1].name, "Election 2");
    }

    function testGetElectionsIncludesCancelled() public {
        _createElection();

        vm.prank(person1);
        voteContract.cancelElection(1);

        Votium.ElectionView[] memory elections = voteContract.getElections();
        assertEq(elections.length, 1);
        assertEq(elections[0].cancelled, true);
    }

    // ============================================
    // GET ELECTION BY ID TESTS
    // ============================================

    function testGetElectionByIdSuccess() public {
        _createElection();

        Votium.ElectionView memory e = voteContract.getElectionById(1);
        
        assertEq(e.name, "Election 1");
        assertEq(e.description, "This is the first demo election");
        assertEq(e.image, "ipfs://image1");
        assertEq(e.cancelled, false);
        assertEq(e.totalVotes, 0);
    }

    function testGetElectionByIdRevertsNotFound() public {
        vm.expectRevert(Votium.ElectionNotFound.selector);
        voteContract.getElectionById(999);
    }

    // ============================================
    // GET ELECTION BY ID WITH RESULT TESTS
    // ============================================

    function testGetElectionByIdWithResultSuccess() public {
        _createElection();

        // Cast some votes
        vm.prank(person1);
        voteContract.vote(1, 1);

        vm.prank(person2);
        voteContract.vote(1, 1);

        vm.prank(person3);
        voteContract.vote(1, 2);

        // Warp past deadline
        vm.warp(block.timestamp + 11 minutes);

        Votium.ElectionViewResult memory e = voteContract.getElectionByIdWithResult(1);
        
        assertEq(e.name, "Election 1");
        assertEq(e.totalVotes, 3);
        assertEq(e.candidates.length, 2);
        assertEq(e.candidates[0].voteCount, 2); // Alice got 2 votes
        assertEq(e.candidates[1].voteCount, 1); // Bob got 1 vote
    }

    function testGetElectionByIdWithResultRevertsNotFound() public {
        vm.expectRevert(Votium.ElectionNotFound.selector);
        voteContract.getElectionByIdWithResult(999);
    }

    function testGetElectionByIdWithResultRevertsNotEnded() public {
        _createElection();

        vm.expectRevert(Votium.ElectionNotEndedYet.selector);
        voteContract.getElectionByIdWithResult(1);
    }

    function testGetElectionByIdWithResultShowsCancelledElection() public {
        _createElection();

        vm.prank(person1);
        voteContract.cancelElection(1);

        // Warp past deadline
        vm.warp(block.timestamp + 11 minutes);

        Votium.ElectionViewResult memory e = voteContract.getElectionByIdWithResult(1);
        assertEq(e.cancelled, true);
    }

    // ============================================
    // PAUSE / UNPAUSE TESTS
    // ============================================

    function testPauseSuccess() public {
        vm.prank(owner);
        voteContract.pause();

        assertEq(voteContract.paused(), true);
    }

    function testPauseRevertsNotOwner() public {
        vm.prank(person1);
        vm.expectRevert();
        voteContract.pause();
    }

    function testUnpauseSuccess() public {
        vm.prank(owner);
        voteContract.pause();

        vm.prank(owner);
        voteContract.unpause();

        assertEq(voteContract.paused(), false);
    }

    function testUnpauseRevertsNotOwner() public {
        vm.prank(owner);
        voteContract.pause();

        vm.prank(person1);
        vm.expectRevert();
        voteContract.unpause();
    }

    function testActionsWorkAfterUnpause() public {
        string[] memory candidates = _createValidCandidates();

        vm.prank(owner);
        voteContract.pause();

        vm.prank(owner);
        voteContract.unpause();

        // Should work now
        vm.prank(person1);
        voteContract.createElection("Election", "Desc", "img", candidates, 10);

        assertEq(voteContract.totalElectionIds(), 1);
    }

    // ============================================
    // TRANSFER OWNERSHIP TESTS
    // ============================================

    function testTransferToNewOwnerSuccess() public {
        vm.prank(owner);
        voteContract.transferToNewOwner(person1);

        assertEq(voteContract.owner(), person1);
    }

    function testTransferToNewOwnerRevertsNotOwner() public {
        vm.prank(person1);
        vm.expectRevert();
        voteContract.transferToNewOwner(person2);
    }

    function testNewOwnerCanPause() public {
        vm.prank(owner);
        voteContract.transferToNewOwner(person1);

        vm.prank(person1);
        voteContract.pause();

        assertEq(voteContract.paused(), true);
    }

    function testOldOwnerCannotPauseAfterTransfer() public {
        vm.prank(owner);
        voteContract.transferToNewOwner(person1);

        vm.prank(owner);
        vm.expectRevert();
        voteContract.pause();
    }

    // ============================================
    // RECEIVE / FALLBACK TESTS
    // ============================================

    function testReceiveRevertsOnDirectETH() public {
        vm.deal(person1, 1 ether);

        vm.prank(person1);
        vm.expectRevert("Direct ETH not allowed");
        (bool success, ) = address(voteContract).call{value: 1 ether}("");
        // This line won't execute due to revert, but for completeness
        assertFalse(success);
    }

    function testFallbackRevertsOnInvalidCall() public {
        vm.prank(person1);
        vm.expectRevert("Invalid call");
        (bool success, ) = address(voteContract).call(abi.encodeWithSignature("nonExistentFunction()"));
        assertFalse(success);
    }

    function testFallbackRevertsOnInvalidCallWithETH() public {
        vm.deal(person1, 1 ether);

        vm.prank(person1);
        vm.expectRevert("Invalid call");
        (bool success, ) = address(voteContract).call{value: 1 ether}(abi.encodeWithSignature("nonExistentFunction()"));
        assertFalse(success);
    }

    // ============================================
    // EDGE CASE / INTEGRATION TESTS
    // ============================================

    function testVoteAtExactDeadline() public {
        _createElection();
        
        // Get the exact deadline
        Votium.ElectionView memory e = voteContract.getElectionById(1);
        
        // Warp to exactly at deadline (should fail - deadline <= block.timestamp)
        vm.warp(e.deadline);

        vm.prank(person2);
        vm.expectRevert(Votium.ElectionEnded.selector);
        voteContract.vote(1, 1);
    }

    function testVoteOneSecondBeforeDeadline() public {
        _createElection();
        
        Votium.ElectionView memory e = voteContract.getElectionById(1);
        
        // Warp to 1 second before deadline (should succeed)
        vm.warp(e.deadline - 1);

        vm.prank(person2);
        voteContract.vote(1, 1);

        Votium.ElectionView memory eAfter = voteContract.getElectionById(1);
        assertEq(eAfter.totalVotes, 1);
    }

    function testCancelAtExactDeadline() public {
        _createElection();
        
        Votium.ElectionView memory e = voteContract.getElectionById(1);
        
        // Warp to exactly at deadline
        vm.warp(e.deadline);

        vm.prank(person1);
        vm.expectRevert(Votium.ElectionAlreadyEnded.selector);
        voteContract.cancelElection(1);
    }

    function testFullElectionLifecycle() public {
        // 1. Create election
        string[] memory candidates = new string[](3);
        candidates[0] = "Alice";
        candidates[1] = "Bob";
        candidates[2] = "Charlie";

        vm.prank(person1);
        voteContract.createElection(
            "President Election",
            "Vote for your favorite candidate",
            "ipfs://election-image",
            candidates,
            60 // 60 minutes
        );

        // 2. Multiple people vote
        vm.prank(person1);
        voteContract.vote(1, 1); // Alice

        vm.prank(person2);
        voteContract.vote(1, 1); // Alice

        vm.prank(person3);
        voteContract.vote(1, 2); // Bob

        // 3. Check intermediate state
        Votium.ElectionView memory midState = voteContract.getElectionById(1);
        assertEq(midState.totalVotes, 3);
        assertEq(midState.cancelled, false);

        // 4. Warp to after deadline
        vm.warp(block.timestamp + 61 minutes);

        // 5. Get results
        Votium.ElectionViewResult memory results = voteContract.getElectionByIdWithResult(1);
        
        assertEq(results.totalVotes, 3);
        assertEq(results.candidates[0].name, "Alice");
        assertEq(results.candidates[0].voteCount, 2);
        assertEq(results.candidates[1].name, "Bob");
        assertEq(results.candidates[1].voteCount, 1);
        assertEq(results.candidates[2].name, "Charlie");
        assertEq(results.candidates[2].voteCount, 0);
    }

    function testCancelledElectionCannotReceiveVotes() public {
        _createElection();

        // Vote once
        vm.prank(person2);
        voteContract.vote(1, 1);

        // Cancel
        vm.prank(person1);
        voteContract.cancelElection(1);

        // Try to vote after cancel
        vm.prank(person3);
        vm.expectRevert(Votium.ElectionIsCancelled.selector);
        voteContract.vote(1, 1);

        // Verify vote count didn't change
        Votium.ElectionView memory e = voteContract.getElectionById(1);
        assertEq(e.totalVotes, 1);
    }

    function testBoundaryNameLength() public {
        string[] memory candidates = _createValidCandidates();
        
        // Exactly 30 chars - should work
        string memory name30 = "123456789012345678901234567890";
        
        vm.prank(person1);
        voteContract.createElection(name30, "Desc", "img", candidates, 10);
        
        Votium.ElectionView memory e = voteContract.getElectionById(1);
        assertEq(bytes(e.name).length, 30);
    }

    function testBoundaryDescriptionLength() public {
        string[] memory candidates = _createValidCandidates();
        
        // Exactly 200 chars - should work
        bytes memory desc200Bytes = new bytes(200);
        for (uint256 i = 0; i < 200; i++) {
            desc200Bytes[i] = "a";
        }
        string memory desc200 = string(desc200Bytes);
        
        vm.prank(person1);
        voteContract.createElection("Election", desc200, "img", candidates, 10);
        
        Votium.ElectionView memory e = voteContract.getElectionById(1);
        assertEq(bytes(e.description).length, 200);
    }
}
