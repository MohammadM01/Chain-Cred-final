import { useState } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES } from '@web3auth/base';

const LoginButton = ({ setWallet }) => {
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const web3auth = new Web3Auth({
        clientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID,
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: '0x1623', // opBNB testnet
          rpcTarget: import.meta.env.VITE_OPBNB_RPC,
        },
      });
      await web3auth.initModal();
      const provider = await web3auth.connect();
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();
      setWallet({ provider, address });
    } catch (error) {
      console.error('Login failed:', error);
    }
    setLoading(false);
  };

  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      onClick={login}
      disabled={loading}
    >
      {loading ? 'Connecting...' : 'Login with Web3Auth'}
    </button>
  );
};

export default LoginButton;