# ChainCred Architecture

## Overview
ChainCred is a decentralized verifiable credential platform built on the BNB ecosystem. It uses opBNB testnet for minting soulbound NFTs and BNB Greenfield testnet for storing PDFs and metadata. The backend (Node.js/Express) handles APIs for authentication, uploading, minting, and verification, with MongoDB for data storage. Smart contracts are in Solidity, deployed via Hardhat.

### Key Components
- **Frontend**: React + Tailwind (separate); integrates via REST APIs with CORS for localhost:3000.
- **Backend**: Express server on port 3000; utils for Greenfield/opBNB interactions.
- **Database**: MongoDB Atlas (Users: wallet/role; Certificates: details/hash/tokenId).
- **Smart Contract**: SoulboundCredential.sol (non-transferable ERC-721) on opBNB testnet.
- **Storage**: BNB Greenfield for PDFs/metadata (public read).
- **Security**: Wallet signature verification; role-based access ('institute' for upload/mint).

### Flow Diagram (ASCII)
[Frontend/Web3Auth] --> Wallet Sign In --> /api/auth/register (Save User in MongoDB)
--> /api/auth/verify-wallet (Verify Signature)

[Institute User] --> Upload PDF + Details --> /api/upload (Multer)
| --> Upload PDF to Greenfield --> Get fileUrl, fileHash
| --> Generate Metadata JSON (with SHA256 certificateID)
| --> Upload Metadata to Greenfield --> Get metadataUrl
| --> Save Certificate in MongoDB
|
--> Mint NFT --> /api/mint (Ethers.js)
--> Interact with SoulboundCredential on opBNB testnet
--> Update tokenId in MongoDB

[Verifier/Anyone] --> Query by certificateID or studentWallet --> /api/verify
| --> Fetch from MongoDB
| --> Verify ownership on opBNB (contract.verify)
| --> Fetch metadata from Greenfield
| --> Recompute & match hash
--> Return { valid, details }

text

### Data Flow Notes
- **Auth**: Wallet-based; no sessions (stateless for MVP).
- **Upload**: Multipart PDF → Greenfield → Metadata gen/upload → DB.
- **Mint**: Calls contract.mint(studentWallet, metadataUrl) → Update DB.
- **Verify**: DB + Chain check + Hash validation.
- **Error Handling**: Uniform JSON responses; try/catch in controllers.

### Assumptions & Limitations for MVP
- Contract deployed manually; address in .env.
- Greenfield bucket pre-created.
- No advanced auth (e.g., JWT); simple signature verify.
- Testnets only; gas fees minimal on opBNB.