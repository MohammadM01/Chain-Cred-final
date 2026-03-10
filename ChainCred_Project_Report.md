# ChainCred: Decentralized Credential Verification System

## Final Project Report

### 1. Abstract

In the modern professional landscape, the validation of academic and professional accomplishments remains a significant hurdle. ChainCred introduces a decentralized solution to eliminate credential fraud and streamline the verification process. By utilizing **Soulbound Tokens (SBTs)** on the **opBNB testnet**, ChainCred ensures that certificates are non-transferable, tamper-proof, and permanently linked to the earner's identity. This report details the architecture, implementation, and future potential of ChainCred, a platform built to foster trust in a digital-first world.

---

### 2. Contents

1. **Abstract**
2. **Chapter 1: Introduction**
   - 1.1 Literature Survey
   - 1.2 Problem Definition
   - 1.3 Objectives
   - 1.4 Proposed Solution
   - 1.5 Technology Stack
3. **Chapter 2: System Design & Requirements**
   - 2.1 System Architecture
   - 2.2 Operational Flow
   - 2.3 Software Requirements
   - 2.4 Cost Estimation
4. **Chapter 3: Implementation & Snapshots**
   - 3.1 Smart Contract Logic
   - 3.2 Backend Integration
   - 3.3 Dashboard Walkthrough
   - 3.4 Future Directions
5. **Chapter 4: Conclusion**
6. **References**

---

### 3. List of Figures and Tables

- **Figure 1**: Soulbound Token Issuance Logic.
- **Figure 2**: High-level System Architecture (Frontend-Backend-Blockchain).
- **Table 1**: Development Environment and Tools.
- **Table 2**: Gas Fee Projections (opBNB).

---

### 4. Chapter 1: Foundations

#### 1.1 Literature Survey

Traditional verification relies on centralized databases or manual checks, which are slow and prone to error. Existing blockchain solutions often use standard NFTs, which can be traded or transferred, making them unsuitable for credentials. ChainCred bridges this gap by adopting the **Soulbound NFT** standard, ensuring "once earned, always owned" without the possibility of unauthorized transfer.

#### 1.2 Problem Definition

The "resume gap" and credential forgery cost businesses billions. Verifying a degree or a certification usually requires contacting a third-party authority, which can take weeks. There is a clear need for an instant, trustless, and cost-effective verification layer.

#### 1.3 Objectives

- **Security**: Eliminate forgery through cryptographic proof.
- **Ownership**: Give users full control over their digital reputation.
- **Scalability**: Support bulk issuance for large institutions.
- **Efficiency**: Provide sub-second verification for recruiters.

#### 1.4 Proposed Solution

ChainCred provides an end-to-end platform where:

1. **Institutes** can mint digital certificates as Soulbound NFTs.
2. **Students** can display their verified credentials in a unified dashboard.
3. **Verifiers** can use a QR code or wallet address to confirm authenticity instantly.

#### 1.5 Technology Stack

- **Frontend**: React.js with Tailwind CSS for a responsive, modern UI.
- **Backend**: Node.js and Express for API management.
- **Blockchain**: opBNB (Low-cost L2 solution) and BNB Greenfield (Decentralized storage).
- **Smart Contracts**: Solidity (ERC-721 Soulbound adaptation).
- **Database**: MongoDB for certificate tracking and metadata caching.

---

### 5. Chapter 2: System Design

#### 2.1 System Architecture

The system follows a three-tier architecture:

- **Client Tier**: Dashboards for Institutes and Students.
- **Application Tier**: A Node.js backend handling file uploads, metadata generation, and AI-driven networking insights.
- **Blockchain Tier**: The opBNB network hosting the `SoulboundCredential` contract.

#### 2.2 Operational Flow

1. **Issuance**: Institute uploads a PDF and student wallet.
2. **Metadata**: Backend generates a JSON metadata file and stores it on Greenfield.
3. **Minting**: The smart contract mints an SBC (Soulbound Credential) with the metadata URI.
4. **Verification**: A verifier inputs the Token ID or scans a QR, and the contract confirms the current owner.

#### 2.3 Software Requirements

- OS: Windows 10/11
- Node.js: v18+
- Hardhat: For smart contract testing.
- Web3Auth/Ethers.js: For blockchain interaction.

#### 2.4 Cost Estimation

By choosing the **opBNB testnet**, transaction fees are negligible (often less than $0.001 per mint). This makes the platform viable for mass academic adoption without the burden of high gas costs.

---

### 6. Chapter 3: Implementation Detail

#### 3.1 Smart Contract Logic

The `SoulboundCredential.sol` contract overrides the `_update` and `approve` functions of the standard ERC-721 to prevent any form of transfer.

```solidity
// Overriding update to prevent transfers while allowing minting
function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
    address from = _ownerOf(tokenId);
    require(from == address(0), "Token is soulbound and non-transferable");
    return super._update(to, tokenId, auth);
}
```

#### 3.2 Dashboard Snapshots

- **Institute Dashboard**: Featuring a sleek "Quick Upload" interface and a monitoring panel for all issued credentials.
- **Student Dashboard**: A personalized profile showing earned badges, verification QR codes, and a professional skill graph.
- **Bulk Issuance**: A newly integrated feature allowing deans/teachers to upload CSV files for mass distribution, significantly reducing manual effort.

#### 3.3 Future Directions

We aim to further humanize the platform by:

1. **AI Automations**: Using OCR to automatically extract names from PDFs.
2. **Classroom Integration**: Creating "Virtual Classrooms" where students join via a join-code, and certificates are auto-distributed.
3. **Professional Networking**: Expanding the AI Networking Agent to connect students with similar skill sets based on their verified badges.

---

### 7. Chapter 4: Conclusion

ChainCred represents a significant step forward in digital identity. By combining the security of blockchain with a user-friendly interface, we have created a platform that is not only technically robust but also practically applicable for educational and professional institutions worldwide.

---

### 8. References

1. BNB Greenfield Documentation (Official).
2. Ethereum Improvement Proposal (EIP-5192): Soulbound Tokens.
3. opBNB Layer 2 Scaling Solutions Guide.
