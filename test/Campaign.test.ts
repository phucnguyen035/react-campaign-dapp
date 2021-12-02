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
      campaign = campaign.connect(signers[1]);

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

  describe('Create request function', () => {
    it('should revert if sender is not the manager', async () => {
      const user = signers[1];
      campaign = campaign.connect(user);
      const trx = campaign.createRequest(
        'description',
        10,
        await user.getAddress()
      );

      await expect(trx).to.be.revertedWith('Only manager is allowed');
    });

    it('should add request with all valid parameters', async () => {
      const description = 'description';
      const value = 10;
      const recipient = await signers[1].getAddress();

      await campaign.createRequest(description, value, recipient);

      const req = await campaign.requests(0);

      expect(req.description).to.eq(description);
      expect(req.value).to.eq(value);
      expect(req.recipient).to.eq(recipient);
      expect(req.status).to.eq('pending');
    });
  });
});
