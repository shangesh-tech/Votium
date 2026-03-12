# Votium

**Votium** is a decentralized, blockchain-based voting platform that enables secure, transparent, and tamper-proof elections. Users can create elections with multiple candidates, cast votes on-chain, and view immutable results — all without trusting a central authority.

## Key Features

- **On-chain Elections** — Create elections with 2–6 candidates, custom names, descriptions, IPFS-hosted images, and configurable deadlines.
- **Secure Voting** — One vote per address per election; votes are accepted only before the deadline.
- **Transparent Results** — Vote counts are hidden during active elections and automatically revealed after the deadline.
- **Account Abstraction (ERC-4337)** — Gasless voting experience powered by smart accounts and gas sponsorship.
- **Emergency Controls** — Contract owner can pause/unpause the platform for safety.
- **Multi-chain Support** — Deployable on Base Sepolia and Polygon Amoy.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity ^0.8.20, OpenZeppelin, Foundry |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Web3 Integration | Thirdweb SDK (wallet connect, Account Abstraction) |
| Testing | Forge (Foundry test suite) |

## Project Structure

```
Votium/
├── protocol/   # Solidity smart contracts (Foundry)
│   ├── src/    # Votium.sol — core voting contract
│   ├── test/   # Comprehensive Forge test suite
│   └── script/ # Deployment scripts
└── client/     # Next.js web frontend
    └── app/    # Pages: home, elections, create, vote, results
```

## Protocol Setup

```shell
forge init --no-git

forge install OpenZeppelin/openzeppelin-contracts
```