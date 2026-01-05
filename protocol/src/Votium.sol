// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Votium - Decentralized Voting System
 * @dev A secure on-chain voting platform with election management and result tracking
 */
contract Votium is Ownable, Pausable {
    error InvalidNameLength();
    error InvalidDescriptionLength();
    error InvalidImageLength();
    error DeadlineMustBeInFuture();
    error InvalidCandidateCount();
    error EmptyCandidateName();
    error DuplicateCandidateNames();
    error ElectionNotFound();
    error NotElectionCreator();
    error ElectionAlreadyEnded();
    error AlreadyCancelled();
    error ElectionIsCancelled();
    error AlreadyVoted();
    error ElectionEnded();
    error InvalidCandidateId();
    error ElectionNotEndedYet();
    error InvalidSectionId();

    uint256 public totalElectionIds = 0;
    uint256 public immutable MIN_CANDIDATES = 2;
    uint256 public immutable MAX_CANDIDATES = 6;

    struct CandidateStruct {
        //---- Slot 0 (packed) with 8 bytes and padding 24 ----
        uint32 candidateId;
        uint32 voteCount;
        // --- slot 1 ---- 32 bytes
        string name;
    }

    struct ElectionStruct {
        // ---- Slot 0 (packed) ----
        address creatorAddress; // 20 bytes
        bool cancelled; // 1 byte Packed with address in same storage slot
        // 11 bytes padding

        // ---- Slot 1 ----
        bytes32 sectionId; // keccak256("S69") or keccak256("All") - 32 bytes
        // ---- Slot 2 ----
        uint64 deadline; // 8 bytes
        // 24 bytes padding
        // ---- Slot 3 ----
        uint256 totalVotes; // 32 bytes - prevents overflow

        // ---- Dynamic data ---- 32 bytes each
        string name;
        string description;
        string image;
        CandidateStruct[] candidates;
        // ---- Always last ---- 32 bytes
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => ElectionStruct) private elections;

    event ElectionCreated(
        uint256 id,
        address indexed creator,
        string name,
        string description,
        string image,
        uint256 deadline
    );

    event VoteSubmitted(
        uint256 indexed electionId,
        address indexed voterAddress,
        uint256 indexed candidateId
    );

    event ElectionCancelled(uint256 indexed electionId);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Creates a new election with specified candidates and deadline
     * @dev Validates all input parameters and initializes election state
     * @param _name Election name (max 30 characters)
     * @param _description Election description (max 200 characters)
     * @param _image IPFS hash or image URL for election
     * @param _sectionId Section identifier (e.g., "S69" or "All")
     * @param _candidatesNames Array of candidate names (2-6 candidates)
     * @param _deadline Duration in minutes until election ends
     */
    function createElection(
        string calldata _name,
        string calldata _description,
        string calldata _image,
        string calldata _sectionId,
        string[] memory _candidatesNames,
        uint256 _deadline
    ) public whenNotPaused {
        if (bytes(_name).length == 0 || bytes(_name).length > 30)
            revert InvalidNameLength();
        if (bytes(_description).length == 0 || bytes(_description).length > 200)
            revert InvalidDescriptionLength();
        if (bytes(_image).length == 0) revert InvalidImageLength();
        if (bytes(_sectionId).length == 0) revert InvalidSectionId();
        if (block.timestamp + (_deadline * 1 minutes) <= block.timestamp)
            revert DeadlineMustBeInFuture();

        uint256 candidateCount = _candidatesNames.length;
        if (candidateCount < MIN_CANDIDATES || candidateCount > MAX_CANDIDATES)
            revert InvalidCandidateCount();

        for (uint256 i = 0; i < candidateCount; ) {
            if (bytes(_candidatesNames[i]).length == 0)
                revert EmptyCandidateName();

            for (uint256 j = i + 1; j < candidateCount; ) {
                if (
                    keccak256(bytes(_candidatesNames[i])) ==
                    keccak256(bytes(_candidatesNames[j]))
                ) revert DuplicateCandidateNames();

                unchecked {
                    ++j;
                }
            }

            unchecked {
                ++i;
            }
        }

        totalElectionIds++;
        uint256 electionId = totalElectionIds;
        uint256 deadline = block.timestamp + (_deadline * 1 minutes);

        ElectionStruct storage newElection = elections[electionId];
        newElection.creatorAddress = msg.sender;
        newElection.name = _name;
        newElection.description = _description;
        newElection.image = _image;
        newElection.sectionId = keccak256(bytes(_sectionId));
        newElection.deadline = uint64(deadline);
        newElection.totalVotes = 0;

        for (uint256 i = 0; i < candidateCount; ) {
            newElection.candidates.push(
                CandidateStruct({
                    candidateId: uint32(i + 1),
                    name: _candidatesNames[i],
                    voteCount: 0
                })
            );
            unchecked {
                ++i;
            }
        }
        emit ElectionCreated(
            electionId,
            msg.sender,
            _name,
            _description,
            _image,
            deadline
        );
    }

    /**
     * @notice Cancels an election before its deadline
     * @dev Only election creator can cancel, and only before deadline passes
     * @param _electionId The ID of the election to cancel
     */
    function cancelElection(uint256 _electionId) public whenNotPaused {
        if (bytes(elections[_electionId].name).length == 0)
            revert ElectionNotFound();
        if (elections[_electionId].creatorAddress != msg.sender)
            revert NotElectionCreator();
        if (elections[_electionId].deadline <= block.timestamp)
            revert ElectionAlreadyEnded();
        if (elections[_electionId].cancelled) revert AlreadyCancelled();

        elections[_electionId].cancelled = true;
        emit ElectionCancelled(_electionId);
    }

    /**
     * @notice Submits a vote for a candidate in an election
     * @dev Validates election exists, is active, voter hasn't voted, and candidate ID is valid
     * @param _electionId The ID of the election to vote in
     * @param _candidateId The ID of the candidate to vote for (1-indexed)
     */
    function vote(
        uint256 _electionId,
        uint256 _candidateId,
        string calldata _sectionId
    ) public whenNotPaused {
        ElectionStruct storage election = elections[_electionId];
        
        if (bytes(election.name).length == 0)
            revert ElectionNotFound();
        if (election.cancelled) revert ElectionIsCancelled();
        if (election.hasVoted[msg.sender]) revert AlreadyVoted();
        if (election.sectionId != keccak256(bytes(_sectionId)))
            revert InvalidSectionId();
        if (election.deadline <= block.timestamp)
            revert ElectionEnded();
        if (
            _candidateId == 0 ||
            _candidateId > election.candidates.length
        ) revert InvalidCandidateId();

        election.hasVoted[msg.sender] = true;
        uint256 index = _candidateId - 1;
        election.candidates[index].voteCount++;
        election.totalVotes++;
        emit VoteSubmitted(_electionId, msg.sender, _candidateId);
    }

    struct ElectionView {
        string name;
        string description;
        string image;
        uint256 deadline;
        uint256 totalVotes;
        bool hasVoted;
        bool cancelled;
    }

    struct ElectionViewResult {
        string name;
        string description;
        string image;
        uint256 deadline;
        uint256 totalVotes;
        CandidateStruct[] candidates;
        bool hasVoted;
        bool cancelled;
    }

    struct ElectionWithCandidates {
        string name;
        string description;
        string image;
        uint256 deadline;
        uint256 totalVotes;
        CandidateStruct[] candidates;
        bool hasVoted;
        bool cancelled;
    }

    /**
     * @notice Retrieves all elections with their current state
     * @dev Returns array of all elections
     * @return Array of ElectionView structs containing election details
     */
    function getElections() external view returns (ElectionView[] memory) {
        ElectionView[] memory electionsArr = new ElectionView[](
            totalElectionIds
        );
        for (uint256 i = 0; i < totalElectionIds; ) {
            ElectionStruct storage e = elections[i + 1];
            electionsArr[i] = ElectionView({
                name: e.name,
                description: e.description,
                image: e.image,
                deadline: e.deadline,
                totalVotes: e.totalVotes,
                hasVoted: e.hasVoted[msg.sender],
                cancelled: e.cancelled
            });
            unchecked {
                ++i;
            }
        }
        return electionsArr;
    }

    /**
     * @notice Retrieves basic details for a specific election
     * @dev Returns election details without candidates array
     * @param _electionId The ID of the election to retrieve
     * @return ElectionView struct containing election details
     */
    function getElectionById(
        uint256 _electionId
    ) external view returns (ElectionView memory) {
        if (bytes(elections[_electionId].name).length == 0)
            revert ElectionNotFound();

        ElectionStruct storage e = elections[_electionId];
        return
            ElectionView({
                name: e.name,
                description: e.description,
                image: e.image,
                deadline: e.deadline,
                totalVotes: e.totalVotes,
                hasVoted: e.hasVoted[msg.sender],
                cancelled: e.cancelled
            });
    }

    /**
     * @notice Retrieves results for a specific election
     * @dev Only returns data after election deadline has passed
     * @param _electionId The ID of the election to retrieve
     * @return ElectionViewResult struct containing election details and results
     */
    function getElectionByIdWithResult(
        uint256 _electionId
    ) external view returns (ElectionViewResult memory) {
        if (bytes(elections[_electionId].name).length == 0)
            revert ElectionNotFound();
        if (elections[_electionId].deadline > block.timestamp)
            revert ElectionNotEndedYet();

        ElectionStruct storage e = elections[_electionId];
        return
            ElectionViewResult({
                name: e.name,
                description: e.description,
                image: e.image,
                deadline: e.deadline,
                totalVotes: e.totalVotes,
                candidates: e.candidates,
                hasVoted: e.hasVoted[msg.sender],
                cancelled: e.cancelled
            });
    }

    /**
     * @notice Retrieves election with candidate names (vote counts hidden until deadline)
     * @dev Allows voters to see candidates during active elections
     * @param _electionId The ID of the election to retrieve
     * @return ElectionWithCandidates struct with candidates (vote counts set to 0 if election is active)
     */
    function getElectionWithCandidates(
        uint256 _electionId
    ) external view returns (ElectionWithCandidates memory) {
        if (bytes(elections[_electionId].name).length == 0)
            revert ElectionNotFound();

        ElectionStruct storage e = elections[_electionId];
        uint256 len = e.candidates.length;
        CandidateStruct[] memory candidates = new CandidateStruct[](len);
        
        // Hide vote counts if election is still active
        bool isActive = e.deadline > block.timestamp;
        
        for (uint256 i = 0; i < len; ) {
            candidates[i] = CandidateStruct({
                candidateId: e.candidates[i].candidateId,
                name: e.candidates[i].name,
                voteCount: isActive ? 0 : e.candidates[i].voteCount
            });
            unchecked { ++i; }
        }
        
        return ElectionWithCandidates({
            name: e.name,
            description: e.description,
            image: e.image,
            deadline: e.deadline,
            totalVotes: isActive ? 0 : e.totalVotes,
            candidates: candidates,
            hasVoted: e.hasVoted[msg.sender],
            cancelled: e.cancelled
        });
    }

    /**
     * @notice Pause contract (emergency stop) (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Transfer ownership to a new address (only owner)
     * @param newOwner New owner address
     */
    function transferToNewOwner(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }

    /**
     * @notice Fallback to prevent accidental ETH transfers from EOA
     */
    receive() external payable {
        revert("Direct ETH not allowed");
    }

    /**
     * @notice Fallback for invalid function calls
     */
    fallback() external payable {
        revert("Invalid call");
    }
}
