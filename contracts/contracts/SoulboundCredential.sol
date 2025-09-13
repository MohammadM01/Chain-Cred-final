// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SoulboundCredential
 * @dev ERC-721 soulbound token for verifiable credentials. Non-transferable.
 * Built for BNB ecosystem (opBNB testnet) in Binance Hackathon 2025 MVP.
 * Overrides transfer functions to prevent transfers except during mint.
 */
contract SoulboundCredential is ERC721, Ownable {
    // Mapping from token ID to metadata URI
    mapping(uint256 => string) private _tokenURIs;

    // Counter for token IDs
    uint256 private _tokenIdCounter;

    constructor(address initialOwner) ERC721("SoulboundCredential", "SBC") Ownable(initialOwner) {}

    /**
     * @dev Mint a new soulbound token to 'to' with metadata URI.
     * @param to Recipient address (student wallet).
     * @param metadataURI URI pointing to metadata on Greenfield.
     * @return tokenId The minted token ID.
     */
    function mint(address to, string memory metadataURI) public onlyOwner returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = metadataURI;
        return tokenId;
    }

    /**
     * @dev Returns the metadata URI for a given token ID.
     * @param tokenId The token ID.
     * @return The metadata URI.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Verify if 'owner' owns the 'tokenId'.
     * @param owner Address to check.
     * @param tokenId Token ID to verify.
     * @return True if owner matches, false otherwise.
     */
    function verify(address owner, uint256 tokenId) public view returns (bool) {
        return ownerOf(tokenId) == owner;
    }

    // Override transfer functions to make soulbound (non-transferable)
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        // Allow minting (from == address(0)), revert otherwise
        require(from == address(0), "SoulboundCredential: Token is soulbound and non-transferable");
        return super._update(to, tokenId, auth);
    }

    // Prevent approvals (soulbound tokens shouldn't be approvable)
    function approve(address to, uint256 tokenId) public virtual override {
        revert("SoulboundCredential: Approvals not allowed for soulbound tokens");
    }

    function setApprovalForAll(address operator, bool approved) public virtual override {
        revert("SoulboundCredential: Approvals not allowed for soulbound tokens");
    }
}
