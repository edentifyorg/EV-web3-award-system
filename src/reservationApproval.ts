import { ethers } from 'ethers';

export function buildReservationApprovalTransaction(input: {
  tokenContractAddress: string;
  treasuryAddress: string;
  walletAddress: string;
  allowanceSparkz: number;
}) {
  if (!Number.isFinite(input.allowanceSparkz) || input.allowanceSparkz <= 0) {
    throw new Error('allowanceSparkz must be greater than 0');
  }
  const tokenInterface = new ethers.Interface(['function approve(address spender, uint256 amount) returns (bool)']);
  return {
    from: ethers.getAddress(input.walletAddress),
    to: ethers.getAddress(input.tokenContractAddress),
    value: '0',
    data: tokenInterface.encodeFunctionData('approve', [
      ethers.getAddress(input.treasuryAddress),
      ethers.parseEther(input.allowanceSparkz.toString()),
    ]),
  };
}
