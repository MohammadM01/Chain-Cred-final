const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const SoulboundCredential = await ethers.getContractFactory("SoulboundCredential");
  // If your contract constructor requires the deployer's address, pass it; otherwise, remove this argument
  const contract = await SoulboundCredential.deploy(deployer.address);

  // Wait for deployment to be mined
  await contract.deployed();
  // This is for ethers v6; if using ethers v5, use contract.deployed()

  console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
