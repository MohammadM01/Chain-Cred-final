import { useState, useEffect } from 'react';
export default function useWallet(){
  const [addr, setAddr] = useState(null);
  useEffect(()=>{
    if(window.ethereum){
      window.ethereum.request({ method: 'eth_accounts' }).then(accounts=>{ if(accounts && accounts[0]) setAddr(accounts[0]); }).catch(()=>{});
    }
  },[]);
  return { addr, setAddr };
}
