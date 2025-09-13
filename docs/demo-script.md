# ChainCred Demo Script for Judges (Binance Hackathon 2025)

## Setup (Before Demo)
- Backend running: `cd backend && npm start` (port 3000).
- MongoDB Atlas connected (fill MONGODB_URI in .env).
- Deployed contract: Run `cd contracts && npx hardhat run scripts/deploy.js --network opbnbTestnet`; update CONTRACT_ADDRESS.
- Postman collection ready for API testing.
- Sample wallets: Issuer (institute), Student (from MetaMask testnet).
- Sample PDF: A dummy certificate file.

## Demo Flow (5-7 minutes)
### 1. Introduction (30s)
"Hi judges, this is ChainCred – a decentralized platform solving credential fraud using BNB Greenfield for storage and opBNB for soulbound NFTs. We'll demo issuance, minting, and verification."

### 2. Register Users (1 min)
- In Postman: POST http://localhost:3000/api/auth/register
  - Body: { "wallet": "0xIssuerWallet", "role": "institute", "name": "University X" }
  - Response: Success with user data.
- Repeat for student: { "wallet": "0xStudentWallet", "role": "student" }
- Explain: "Registers users in MongoDB; roles restrict actions."

### 3. Verify Wallet Signature (1 min)
- In Postman: POST http://localhost:3000/api/auth/verify-wallet
  - Body: { "wallet": "0xIssuerWallet", "message": "Sign this to verify: ChainCred", "signature": "0x... (generate via ethers or MetaMask)" }
  - Response: { success: true, data: { verified: true } }
- Explain: "Verifies signer owns the wallet using ethers.verifyMessage."

### 4. Upload Certificate (1 min)
- In Postman: POST http://localhost:3000/api/upload (multipart/form-data)
  - Fields: file (upload dummy.pdf), studentWallet: "0xStudentWallet", issuerWallet: "0xIssuerWallet"
  - Response: { success: true, data: { metadataUrl, fileHash, certificateID } }
- Explain: "Uploads PDF to Greenfield, generates metadata (with SHA256 ID), uploads JSON to Greenfield, saves to DB. Restricted to 'institute' role."

### 5. Mint Soulbound NFT (1 min)
- In Postman: POST http://localhost:3000/api/mint
  - Body: { "studentWallet": "0xStudentWallet", "metadataUrl": "from previous response", "issuerWallet": "0xIssuerWallet" }
  - Response: { success: true, data: { txHash, tokenId } }
- Check opBNB testnet explorer for tx.
- Explain: "Mints non-transferable NFT on opBNB using Ethers.js; updates DB. Soulbound ensures no transfers."

### 6. Verify Credential (1 min)
- In Postman: POST http://localhost:3000/api/verify?certificateID=from-upload
  - Response: { success: true, data: { valid: true, details: 'Certificate verified', metadata: {...} } }
- Alternate: ?studentWallet=0xStudentWallet
- Explain: "Checks DB, opBNB ownership/tokenURI, fetches metadata from Greenfield, recomputes hash. If tampered, valid=false."

### 7. Wrap-Up (30s)
"ChainCred reduces fraud, empowers users with immutable credentials. Built on BNB for low-cost, fast tx. Questions? Future: Full frontend dashboard."

## Troubleshooting Tips
- If Greenfield upload fails: Check API_KEY and testnet status.
- opBNB tx: Ensure PRIVATE_KEY has test BNB.
- DB: Verify connection in console.
- Postman: Use collection from README.
