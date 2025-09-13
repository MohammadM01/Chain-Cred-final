require('dotenv').config();
const ethers = require('ethers');

async function testContract() {
  try {
    console.log('Testing contract connection...');
    
    // Check environment variables
    console.log('OPBNB_TESTNET_RPC:', process.env.OPBNB_TESTNET_RPC ? 'Set' : 'Not set');
    console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY ? 'Set' : 'Not set');
    console.log('CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS ? 'Set' : 'Not set');
    
    if (!process.env.OPBNB_TESTNET_RPC || !process.env.PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
      console.error('Missing required environment variables');
      return;
    }
    
    // Test provider connection
    const provider = new ethers.JsonRpcProvider(process.env.OPBNB_TESTNET_RPC);
    const network = await provider.getNetwork();
    console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
    
    // Test signer
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const balance = await provider.getBalance(signer.address);
    console.log('Signer address:', signer.address);
    console.log('Balance:', ethers.formatEther(balance), 'BNB');
    
    // Test contract connection
    const contract = new ethers.Contract(
  '0x64E9dEfd211A5a2a1842A904a6C0f2816CD563B8',
      [
        'function mint(address to, string memory metadataURI) returns (uint256)',
        'function verify(address owner, uint256 tokenId) view returns (bool)',
        'function tokenURI(uint256 tokenId) view returns (string)',
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
      ],
      signer
    );
    
    console.log('Contract address:', contract.target);
    
    // Test if contract is deployed
    const code = await provider.getCode(contract.target);
    if (code === '0x') {
      console.error('Contract is not deployed at the specified address');
      return;
    }
    console.log('Contract is deployed and accessible');
    
    // Test basic contract calls
    try {
      const owner = await contract.owner();
      console.log('Contract owner:', owner);
    } catch (error) {
      console.log('Could not get contract owner:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testContract();
