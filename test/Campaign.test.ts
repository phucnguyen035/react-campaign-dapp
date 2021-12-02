import { Signer } from '@ethersproject/abstract-signer';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Campaign } from '../typechain-types';

describe('Campaign contract', () => {
  let campaign: Campaign;
  let signers: Signer[];

  beforeEach(async () => {
    const contract = await ethers.getContractFactory('Campaign');

    signers = await ethers.getSigners();
    campaign = await contract.deploy(1);
  });

  describe('Deployment', () => {
    it('should have correct minimum contribution', async () => {
      expect(await campaign.minContribution()).to.eq(1);
    });

    it('should have the correct manager address', async () => {
      expect(await campaign.manager()).to.eq(await signers[0].getAddress());
    });
  });

  describe('Contribute function', () => {
    it('should revert if has no value', async () => {
      await expect(campaign.contribute()).to.be.revertedWith(
        'Insufficient funds'
      );
    });

    it('should increase the value of contract by the amount of value', async () => {
      const value = 100;
      const user = signers[1];
      campaign = campaign.connect(user);

      await campaign.contribute({ value });

      expect(await campaign.provider.getBalance(campaign.address)).to.eq(value);
    });

    it('should add sender to list of approvers', async () => {
      const user = signers[1];
      campaign = campaign.connect(user);

      await campaign.contribute({ value: 100 });

      expect(await campaign.approvers(0)).to.eq(await user.getAddress());
    });
  });
});
