export const CONTRACT_ADDRESS = "0x2703Cd19A583256e08BB4D9c56d7377a7D74F806";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "get",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "newValue", "type": "uint256" }],
    "name": "set",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
