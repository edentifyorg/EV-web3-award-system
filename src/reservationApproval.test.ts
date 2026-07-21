import { ethers } from 'ethers';
import { buildReservationApprovalTransaction } from './reservationApproval';

describe('external reservation approval', () => {
  it('encodes a capped ERC-20 allowance for the treasury', () => {
    const walletAddress = ethers.Wallet.createRandom().address;
    const treasuryAddress = ethers.Wallet.createRandom().address;
    const tokenContractAddress = ethers.Wallet.createRandom().address;
    const transaction = buildReservationApprovalTransaction({
      walletAddress, treasuryAddress, tokenContractAddress, allowanceSparkz: 5,
    });
    const iface = new ethers.Interface(['function approve(address spender, uint256 amount) returns (bool)']);
    const decoded = iface.decodeFunctionData('approve', transaction.data);
    expect(transaction).toMatchObject({ from: walletAddress, to: tokenContractAddress, value: '0' });
    expect(decoded[0]).toBe(treasuryAddress);
    expect(decoded[1]).toBe(ethers.parseEther('5'));
  });
});
