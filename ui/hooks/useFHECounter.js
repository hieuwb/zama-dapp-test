import { useState } from 'react';
import { ethers } from 'ethers';
import abi from '../lib/FHECounter.json';

const CONTRACT_ADDRESS = "0x2703Cd19A583256e08BB4D9c56d7377a7D74F806";

export default function useFHECounter() {
  const [value, setValue] = useState(null);

  const getProvider = () => {
    if (!window.ethereum) throw new Error("MetaMask not found");
    return new ethers.BrowserProvider(window.ethereum);
  };

  const getContract = async () => {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
  };

  const readValue = async () => {
    try {
      const contract = await getContract();
      const val = await contract.get(); // Tùy hàm đọc
      setValue(val.toString());
    } catch (err) {
      console.error(err);
    }
  };

  const increment = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.increment(1); // Ví dụ tăng 1
      await tx.wait();
      await readValue();
    } catch (err) {
      console.error(err);
    }
  };

  return { value, readValue, increment };
}
