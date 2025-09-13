export async function initWeb3Auth() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts[0]) {
        return accounts[0];
      }
      throw new Error('No accounts returned');
    } catch (error) {
      console.error('Web3Auth error:', error);
      throw new Error('Failed to connect wallet');
    }
  }
  throw new Error('MetaMask or compatible wallet not detected');
}