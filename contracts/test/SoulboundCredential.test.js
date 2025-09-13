const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundCredential", function () {
  let contract, owner, addr1, addr2;

  beforeEach(async function () {
    const SoulboundCredential = await ethers.getContractFactory("SoulboundCredential");
    [owner, addr1, addr2] = await ethers.getSigners();
    contract = await SoulboundCredential.deploy(owner.address);
    await contract.waitForDeployment();
  });

  it("Should mint a token and return correct tokenURI", async function () {
    const metadataURI = "https://example.com/metadata.json";
    await contract.mint(addr1.address, metadataURI);
    const tokenId = 1;

    expect(await contract.tokenURI(tokenId)).to.equal(metadataURI);
    expect(await contract.ownerOf(tokenId)).to.equal(addr1.address);
  });

  it("Should verify owner correctly", async function () {
    const metadataURI = "https://example.com/metadata.json";
    await contract.mint(addr1.address, metadataURI);
    const tokenId = 1;

    expect(await contract.verify(addr1.address, tokenId)).to.be.true;
    expect(await contract.verify(addr2.address, tokenId)).to.be.false;
  });

  it("Should revert on transfer", async function () {
    const metadataURI = "https://example.com/metadata.json";
    await contract.mint(addr1.address, metadataURI);
    const tokenId = 1;

    await expect(contract.connect(addr1).transferFrom(addr1.address, addr2.address, tokenId))
      .to.be.revertedWith("SoulboundCredential: Token is soulbound and non-transferable");
  });

  it("Should revert on approvals", async function () {
    await expect(contract.approve(addr2.address, 1))
      .to.be.revertedWith("SoulboundCredential: Approvals not allowed for soulbound tokens");

    await expect(contract.setApprovalForAll(addr2.address, true))
      .to.be.revertedWith("SoulboundCredential: Approvals not allowed for soulbound tokens");
  });
});
