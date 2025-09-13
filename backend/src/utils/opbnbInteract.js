const ethers = require('ethers');

/**
 * Utility for interacting with opBNB testnet and SoulboundCredential contract.
 * Uses Ethers v6: Provider from OPBNB_TESTNET_RPC, Signer from PRIVATE_KEY, Contract from CONTRACT_ADDRESS.
 * Functions: mint(to, metadataURI), verify(owner, tokenId), getTokenURI(tokenId).
 * For ChainCred MVP: Assumes contract is deployed; handles gas estimation minimally.
 * Error handling: Throws for now; wrap in try/catch in controllers.
 */
const getProvider = () => new ethers.JsonRpcProvider(process.env.OPBNB_TESTNET_RPC);

const getSigner = () => new ethers.Wallet(process.env.PRIVATE_KEY, getProvider());

const getContract = () => new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  [
    'function mint(address to, string memory metadataURI) returns (uint256)',
    'function verify(address owner, uint256 tokenId) view returns (bool)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function totalSupply() view returns (uint256)',
    'function owner() view returns (address)',
    // Add the Transfer event signature:
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
  ],
  getSigner()
);

const TRANSFER_EVENT_TOPIC = ethers.id("Transfer(address,address,uint256)");

const getLatestTokenId = async () => {
  try {
    const contract = getContract();
    // Try to get the token ID counter from the contract
    // Note: This function might not be public in the deployed contract
    try {
      const tokenIdCounter = await contract._tokenIdCounter();
      return tokenIdCounter.toString();
    } catch (error) {
      console.log('_tokenIdCounter function not accessible:', error.message);
      
      // Alternative approach: try to get the total supply or iterate
      try {
        // Some contracts have a totalSupply function
        const totalSupply = await contract.totalSupply();
        return totalSupply.toString();
      } catch (supplyError) {
        console.log('totalSupply function not accessible:', supplyError.message);
        return null;
      }
    }
  } catch (error) {
    console.log('Could not get latest token ID:', error.message);
    return null;
  }
};

const mint = async (to, metadataURI) => {
  try {
    const contract = getContract();
    
    // Check if the contract is properly connected
    console.log('Contract address:', contract.target);
    
    // Get signer address
    const signer = getSigner();
    console.log('Signer address:', await signer.getAddress());
    
    // Check if contract is deployed
    const provider = getProvider();
    const code = await provider.getCode(contract.target);
    
    if (code === '0x') {
      throw new Error('Smart contract is not deployed. Please deploy the SoulboundCredential contract first.');
    }
    
    console.log('Contract is deployed and accessible');
    
    // Estimate gas first
    const gasEstimate = await contract.mint.estimateGas(to, metadataURI);
    console.log('Estimated gas:', gasEstimate.toString());
    
    // Fix for Ethers v6 - use BigInt operations instead of .mul()
    const gasLimit = (BigInt(gasEstimate) * BigInt(120)) / BigInt(100); // Add 20% buffer
    console.log('Gas limit with buffer:', gasLimit.toString());
    
    const tx = await contract.mint(to, metadataURI, { gasLimit: gasLimit });
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction status:', receipt.status);
    console.log('Transaction receipt logs:', JSON.stringify(receipt.logs, null, 2));

    // Check if transaction was successful
    if (receipt.status === 0) {
      throw new Error('Transaction failed on chain');
    }

    // Filter logs for Transfer event from this contract
    const transferLog = receipt.logs.find(
      log =>
        log.address.toLowerCase() === contract.target.toLowerCase() &&
        log.topics[0] === TRANSFER_EVENT_TOPIC
    );

    if (!transferLog) {
      // If no Transfer event found, try to get the token ID from the contract
      console.log('Transfer event not found, trying to get token ID from contract...');
      
      // Wait a bit for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to get the latest token ID
      const latestTokenId = await getLatestTokenId();
      
      if (latestTokenId) {
        return { 
          txHash: receipt.hash, 
          tokenId: latestTokenId,
          note: 'Token ID retrieved from contract state'
        };
      }
      
      throw new Error('Transfer event not found and could not retrieve token ID from contract');
    }

    // Decode the event using the contract interface
    const parsed = contract.interface.parseLog(transferLog);
    const tokenId = parsed.args.tokenId.toString();

    return { txHash: receipt.hash, tokenId };
  } catch (error) {
    console.error('Mint function error:', error);
    
    // Provide specific error information
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for gas fees');
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      throw new Error('Gas estimation failed - contract might not be accessible');
    } else if (error.message.includes('execution reverted')) {
      throw new Error('Transaction reverted - check contract state and parameters');
    } else if (error.message.includes('network')) {
      throw new Error('Network error - check RPC endpoint and network configuration');
    }
    
    throw error;
  }
};

const verify = async (owner, tokenId) => {
  const contract = getContract();
  return await contract.verify(owner, tokenId);
};

const getTokenURI = async (tokenId) => {
  const contract = getContract();
  return await contract.tokenURI(tokenId);
};

const getTokenIdByMetadata = async (owner, metadataURI) => {
  try {
    const contract = getContract();
    
    // This is a more complex approach - we'd need to iterate through tokens
    // For now, let's try to get the latest token ID and check if it matches
    const latestTokenId = await getLatestTokenId();
    
    if (latestTokenId) {
      try {
        const tokenURI = await contract.tokenURI(latestTokenId);
        if (tokenURI === metadataURI) {
          return latestTokenId;
        }
      } catch (error) {
        console.log('Error checking token URI:', error.message);
      }
    }
    
    return null;
  } catch (error) {
    console.log('Error getting token ID by metadata:', error.message);
    return null;
  }
};

module.exports = { mint, verify, getTokenURI, getLatestTokenId, getTokenIdByMetadata };
