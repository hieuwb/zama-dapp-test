import { ethers } from "ethers";
import abi from "./FHECounterABI.json"; // bạn sẽ cần file ABI ở đây

const CONTRACT_ADDRESS = "0x2703Cd19A583256e08BB4D9c56d7377a7D74F806"; // địa chỉ contract của bạn

export function getContract(providerOrSigner: ethers.providers.Provider | ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, abi, providerOrSigner);
}
