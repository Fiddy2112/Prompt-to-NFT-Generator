import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("AINFTMarketplace", function () {
  async function deployFixture() {
    const [owner, seller, buyer] = await hre.ethers.getSigners();

    const AINFT = await ethers.getContractFactory("AINFT");
    const ainft = await AINFT.deploy();

    const Marketplace = await ethers.getContractFactory("AINFTMarketplace");
    const marketplace = await Marketplace.deploy();

    await ainft.connect(owner).setAllowedMinter(seller.address, true);

    const tokenURI =
      "https://gateway.lighthouse.storage/ipfs/bafkreic4mzqcvfwyvntiublbzjrcqo3ribimtfebimbpqb7dd4zspsk5de";

    await ainft.connect(seller).mintNFT(tokenURI);
    const tokenId = await ainft.tokenCount();

    // approve marketplace

    await ainft.connect(seller).approve(marketplace.target, tokenId);

    return {
      owner,
      seller,
      buyer,
      ainft,
      marketplace,
      tokenId,
    };
  }

  describe("Listing and Buying", function () {
    it("should allow seller to list and buyer to purchase NFT", async function () {
      const { seller, buyer, ainft, marketplace, tokenId } = await loadFixture(
        deployFixture
      );

      // Seller lists NFT
      const price = ethers.parseEther("1.0");
      await expect(
        marketplace.connect(seller).listNFT(ainft.target, tokenId, price)
      ).to.emit(marketplace, "Listed");

      const listingId = await marketplace.listingCount();
      const listing = await marketplace.listings(listingId);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);

      // Buyer buys NFT
      await expect(
        marketplace.connect(buyer).buyNFT(listingId, { value: price })
      )
        .to.emit(marketplace, "Purchased")
        .withArgs(listingId, buyer.address);

      const updated = await marketplace.listings(listingId);
      expect(updated.buyer).to.equal(buyer.address);
      expect(updated.isSold).to.equal(true);
      expect(updated.isActive).to.equal(false);

      const buyerPurchases = await marketplace.getPurchasedListingsByUser(
        buyer.address
      );
      expect(buyerPurchases.length).to.equal(1);
      expect(buyerPurchases[0]).to.equal(listingId);

      expect(await ainft.ownerOf(tokenId)).to.equal(buyer.address);
    });

    it("should prevent seller from buying own NFT", async function () {
      const { seller, marketplace, ainft, tokenId } = await loadFixture(
        deployFixture
      );

      const price = ethers.parseEther("1.0");
      await marketplace.connect(seller).listNFT(ainft, tokenId, price);

      const listingId = await marketplace.listingCount();

      await expect(
        marketplace.connect(seller).buyNFT(listingId, { value: price })
      ).to.be.revertedWith("Seller cannot purchase own NFT");
    });

    it("should revert when buyer sends insufficient ETH", async function () {
      const { seller, buyer, marketplace, ainft, tokenId } = await loadFixture(
        deployFixture
      );

      const price = ethers.parseEther("1.0");
      await marketplace.connect(seller).listNFT(ainft.target, tokenId, price);
      const listingId = await marketplace.listingCount();

      await expect(
        marketplace
          .connect(buyer)
          .buyNFT(listingId, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Insufficient payment");
    });
  });
});
