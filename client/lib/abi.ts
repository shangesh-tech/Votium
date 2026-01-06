export const abi = [
    { "type": "constructor", "inputs": [], "stateMutability": "nonpayable" },
    { "type": "fallback", "stateMutability": "payable" },
    { "type": "receive", "stateMutability": "payable" },
    {
      "type": "function",
      "name": "MAX_CANDIDATES",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "MIN_CANDIDATES",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "cancelElection",
      "inputs": [
        { "name": "_electionId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createElection",
      "inputs": [
        { "name": "_name", "type": "string", "internalType": "string" },
        { "name": "_description", "type": "string", "internalType": "string" },
        { "name": "_image", "type": "string", "internalType": "string" },
        { "name": "_sectionId", "type": "string", "internalType": "string" },
        {
          "name": "_candidatesNames",
          "type": "string[]",
          "internalType": "string[]"
        },
        { "name": "_deadline", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getElectionById",
      "inputs": [
        { "name": "_electionId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct Votium.ElectionView",
          "components": [
            { "name": "name", "type": "string", "internalType": "string" },
            {
              "name": "description",
              "type": "string",
              "internalType": "string"
            },
            { "name": "image", "type": "string", "internalType": "string" },
            {
              "name": "deadline",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalVotes",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "hasVoted", "type": "bool", "internalType": "bool" },
            { "name": "cancelled", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getElectionByIdWithResult",
      "inputs": [
        { "name": "_electionId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct Votium.ElectionViewResult",
          "components": [
            { "name": "name", "type": "string", "internalType": "string" },
            {
              "name": "description",
              "type": "string",
              "internalType": "string"
            },
            { "name": "image", "type": "string", "internalType": "string" },
            {
              "name": "deadline",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalVotes",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "candidates",
              "type": "tuple[]",
              "internalType": "struct Votium.CandidateStruct[]",
              "components": [
                {
                  "name": "candidateId",
                  "type": "uint32",
                  "internalType": "uint32"
                },
                {
                  "name": "voteCount",
                  "type": "uint32",
                  "internalType": "uint32"
                },
                { "name": "name", "type": "string", "internalType": "string" }
              ]
            },
            { "name": "hasVoted", "type": "bool", "internalType": "bool" },
            { "name": "cancelled", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getElectionWithCandidates",
      "inputs": [
        { "name": "_electionId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct Votium.ElectionWithCandidates",
          "components": [
            { "name": "name", "type": "string", "internalType": "string" },
            {
              "name": "description",
              "type": "string",
              "internalType": "string"
            },
            { "name": "image", "type": "string", "internalType": "string" },
            {
              "name": "deadline",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalVotes",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "candidates",
              "type": "tuple[]",
              "internalType": "struct Votium.CandidateStruct[]",
              "components": [
                {
                  "name": "candidateId",
                  "type": "uint32",
                  "internalType": "uint32"
                },
                {
                  "name": "voteCount",
                  "type": "uint32",
                  "internalType": "uint32"
                },
                { "name": "name", "type": "string", "internalType": "string" }
              ]
            },
            { "name": "hasVoted", "type": "bool", "internalType": "bool" },
            { "name": "cancelled", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getElections",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct Votium.ElectionView[]",
          "components": [
            { "name": "name", "type": "string", "internalType": "string" },
            {
              "name": "description",
              "type": "string",
              "internalType": "string"
            },
            { "name": "image", "type": "string", "internalType": "string" },
            {
              "name": "deadline",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "totalVotes",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "hasVoted", "type": "bool", "internalType": "bool" },
            { "name": "cancelled", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "pause",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "paused",
      "inputs": [],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "totalElectionIds",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        { "name": "newOwner", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferToNewOwner",
      "inputs": [
        { "name": "newOwner", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "unpause",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "vote",
      "inputs": [
        { "name": "_electionId", "type": "uint256", "internalType": "uint256" },
        {
          "name": "_candidateId",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "_sectionId", "type": "string", "internalType": "string" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "ElectionCancelled",
      "inputs": [
        {
          "name": "electionId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ElectionCreated",
      "inputs": [
        {
          "name": "id",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        },
        {
          "name": "creator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "name",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "description",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "image",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "deadline",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Paused",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "Unpaused",
      "inputs": [
        {
          "name": "account",
          "type": "address",
          "indexed": false,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "VoteSubmitted",
      "inputs": [
        {
          "name": "electionId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "voterAddress",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "candidateId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    { "type": "error", "name": "AlreadyCancelled", "inputs": [] },
    { "type": "error", "name": "AlreadyVoted", "inputs": [] },
    { "type": "error", "name": "DeadlineMustBeInFuture", "inputs": [] },
    { "type": "error", "name": "DuplicateCandidateNames", "inputs": [] },
    { "type": "error", "name": "ElectionAlreadyEnded", "inputs": [] },
    { "type": "error", "name": "ElectionEnded", "inputs": [] },
    { "type": "error", "name": "ElectionIsCancelled", "inputs": [] },
    { "type": "error", "name": "ElectionNotEndedYet", "inputs": [] },
    { "type": "error", "name": "ElectionNotFound", "inputs": [] },
    { "type": "error", "name": "EmptyCandidateName", "inputs": [] },
    { "type": "error", "name": "EnforcedPause", "inputs": [] },
    { "type": "error", "name": "ExpectedPause", "inputs": [] },
    { "type": "error", "name": "InvalidCandidateCount", "inputs": [] },
    { "type": "error", "name": "InvalidCandidateId", "inputs": [] },
    { "type": "error", "name": "InvalidDescriptionLength", "inputs": [] },
    { "type": "error", "name": "InvalidImageLength", "inputs": [] },
    { "type": "error", "name": "InvalidNameLength", "inputs": [] },
    { "type": "error", "name": "InvalidSectionId", "inputs": [] },
    { "type": "error", "name": "NotElectionCreator", "inputs": [] },
    {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
        { "name": "owner", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
        { "name": "account", "type": "address", "internalType": "address" }
      ]
    }
  ];