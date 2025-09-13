const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS; // Set this in .env or hardcode for testing
  const recipient = "0xRecipientAddressHere"; // Replace with actual address
  const metadataURI = "https://greenfield.example.com/metadata.json"; // Replace with actual URI

  const SoulboundCredential = await ethers.getContractAt("SoulboundCredential", contractAddress);
  const tx = await SoulboundCredential.mint(recipient, metadataURI);
  await tx.wait();

  console.log("Minted token to:", recipient);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
