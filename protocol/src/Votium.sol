// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Votium - Decentralized Voting System
 * @dev A secure on-chain voting platform with election management and result tracking
 */
contract Votium is Ownable, Pausable {
    uint256 public totalElectionIds = 0;
    uint256 public immutable MIN_CANDIDATES = 2;
    uint256 public immutable MAX_CANDIDATES = 6;

    struct CandidateStruct {
        uint256 candidateId;
        string name;
        uint256 voteCount;
    }

    struct ElectionStruct {
        address creatorAddress;
        string name;
        string description;
        string image;
        CandidateStruct[] candidates;
        uint256 deadline;
        mapping(address => bool) hasVoted;
        uint256 totalVotes;
        bool cancelled;
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
        address indexed voter_address,
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
     * @param _candidates_names Array of candidate names (2-6 candidates)
     * @param _deadline Duration in minutes until election ends
     */
    function createElection(
        string calldata _name,
        string calldata _description,
        string calldata _image,
        string[] memory _candidates_names,
        uint256 _deadline
    ) public whenNotPaused {
        require(
            bytes(_name).length > 0 && bytes(_name).length <= 30,
            "Invalid name length (30 characters max)"
        );
        require(
            bytes(_description).length > 0 && bytes(_description).length <= 200,
            "Invalid description length (200 characters max)"
        );
        require(bytes(_image).length > 0, "Invalid image length");
        require(
            block.timestamp + (_deadline * 1 minutes) > block.timestamp,
            "Deadline must be in the future"
        );
        require(
            _candidates_names.length >= MIN_CANDIDATES &&
                _candidates_names.length <= MAX_CANDIDATES,
            "Candidates count must be between 2 and 6"
        );

        for (uint256 i = 0; i < _candidates_names.length; i++) {
            require(
                bytes(_candidates_names[i]).length > 0,
                "Candidate name cannot be empty"
            );

            for (uint256 j = i + 1; j < _candidates_names.length; j++) {
                require(
                    keccak256(bytes(_candidates_names[i])) !=
                        keccak256(bytes(_candidates_names[j])),
                    "Duplicate candidate names not allowed"
                );
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
        newElection.deadline = deadline;
        newElection.totalVotes = 0;

        for (uint256 i = 0; i < _candidates_names.length; i++) {
            newElection.candidates.push(
                CandidateStruct({
                    candidateId: i + 1,
                    name: _candidates_names[i],
                    voteCount: 0
                })
            );
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
        require(
            bytes(elections[_electionId].name).length > 0,
            "Election not found"
        );
        require(
            elections[_electionId].creatorAddress == msg.sender,
            "Not election creator"
        );
        require(
            elections[_electionId].deadline > block.timestamp,
            "Election already ended"
        );
        require(!elections[_electionId].cancelled, "Already cancelled");

        elections[_electionId].cancelled = true;
        emit ElectionCancelled(_electionId);
    }

    /**
     * @notice Submits a vote for a candidate in an election
     * @dev Validates election exists, is active, voter hasn't voted, and candidate ID is valid
     * @param _electionId The ID of the election to vote in
     * @param _candidateId The ID of the candidate to vote for (1-indexed)
     */
    function vote(uint256 _electionId, uint256 _candidateId)
        public
        whenNotPaused
    {
        require(
            bytes(elections[_electionId].name).length > 0,
            "Election not found"
        );
        require(
            !elections[_electionId].cancelled,
            "Election has been cancelled"
        );
        require(
            !elections[_electionId].hasVoted[msg.sender],
            "You have already voted for this election"
        );
        require(
            elections[_electionId].deadline > block.timestamp,
            "Election has ended"
        );
        require(
            _candidateId > 0 &&
                _candidateId <= elections[_electionId].candidates.length,
            "Invalid candidate ID"
        );

        elections[_electionId].hasVoted[msg.sender] = true;
        uint256 index = _candidateId - 1;
        elections[_electionId].candidates[index].voteCount++;
        elections[_electionId].totalVotes++;
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

    /**
     * @notice Retrieves all elections with their current state
     * @dev Returns array of all elections
     * @return Array of ElectionView structs containing election details
     */
    function getElections() external view returns (ElectionView[] memory) {
        ElectionView[] memory electionsArr = new ElectionView[](
            totalElectionIds
        );
        for (uint256 i = 0; i < totalElectionIds; i++) {
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
        }
        return electionsArr;
    }


    /**
     * @notice Retrieves basic details for a specific election
     * @dev Returns election details without candidates array
     * @param _electionId The ID of the election to retrieve
     * @return ElectionView struct containing election details
     */
    function getElectionById(uint256 _electionId)
        external
        view
        returns (ElectionView memory)
    {
        require(
            bytes(elections[_electionId].name).length > 0,
            "Election not found"
        );
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
    function getElectionByIdWithResult(uint256 _electionId)
        external
        view
        returns (ElectionViewResult memory)
    {
        require(
            bytes(elections[_electionId].name).length > 0,
            "Election not found"
        );
        require(
            elections[_electionId].deadline < block.timestamp,
            "Election not ended yet"
        );
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