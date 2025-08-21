// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AINFTMarketplace is Ownable,ReentrancyGuard{
    struct Listing {
        address seller;
        address buyer;
        address nftAddress;
        uint256 price;
        uint256 tokenId;
        bool isActive;
        bool isSold;
        uint256 expired;
    }

    uint256 public feePercentage = 2; //fee 2%
    uint256 public listingCount;
    uint256 public listingExpiry = 7 days;

    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public purchaseByUser;

    event Listed(uint256 listingId, address indexed seller, address indexed nftAddress, uint256 tokenId, uint256 price);
    event Purchased(uint256 listingId,address indexed buyer);
    event Cancelled(uint256 listingId);

    constructor() Ownable(msg.sender){}

    function listNFT(address nftAddress, uint256 tokenId, uint256 price) external {
        require(price > 0, 'Price must be greater than zero');

        IERC721 nft = IERC721(nftAddress);

        require(nft.ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(nft.isApprovedForAll(msg.sender, address(this)) || nft.getApproved(tokenId) == address(this), "Marketplace not approved");

        uint256 expiryTime = block.timestamp + listingExpiry;
        listingCount++;

        listings[listingCount] = Listing({
            seller: msg.sender,
            buyer: address(0),
            nftAddress: nftAddress,
            price: price,
            tokenId: tokenId,
            isActive: true,
            isSold:false,
            expired: expiryTime
        });

        userListings[msg.sender].push(listingCount);

        emit Listed(listingCount, msg.sender, nftAddress, tokenId, price);
    }

    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];

        // Check if listing is active and has not expired
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expired, "Listing has expired");

        // Check deposit amount
        require(msg.value >= listing.price, "Insufficient payment");

        // Check for sellers who aren't function callers
        require(listing.seller != msg.sender, "Seller cannot purchase own NFT");

        uint256 fee = (listing.price * feePercentage) / 100;
        uint256 sellerAmount = listing.price - fee;

        listing.isActive = false;
        listing.isSold = true;
        listing.buyer = msg.sender;

        // Send fee to contract owner
        (bool feeSuccess, ) = owner().call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");

        // Send money to seller
        (bool sellerSuccess, ) = listing.seller.call{value: sellerAmount}("");
        require(sellerSuccess, "Seller transfer failed");

        // Transfer NFT to buyer
        IERC721(listing.nftAddress).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        // buyer history
        purchaseByUser[msg.sender].push(listingId);

        emit Purchased(listingId, msg.sender);
    }

    function getActiveListings() external view returns(Listing[] memory) {
        uint256 total = 0;

        for(uint256 i = 1; i <= listingCount; i++){
            if(listings[i].isActive && block.timestamp <= listings[i].expired){
                total++;
            }
        }

        Listing[] memory active = new Listing[](total);
        uint256 index = 0;
        for(uint256 i = 1; i <= listingCount; i++){
            if(listings[i].isActive && block.timestamp <= listings[i].expired){
                active[index] = listings[i];
                index++;
            }
        }

        return active;
    }

    function checkAndCancelExpiredListings() external {
        for(uint256 i = 1; i <= listingCount; i++){
            Listing storage listing = listings[i];
            if(block.timestamp > listing.expired && listing.isActive){
                listing.isActive = false;
                emit Cancelled(i);
            }
        }
    }

    function cancelListing(uint256 listingId) external{
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Already inactive");
        require(listing.seller == msg.sender || msg.sender == owner(),"Not authorized");

        listing.isActive = false;

        emit Cancelled(listingId);
    }

    function getPurchasedListingsByUser(address user) external view returns(uint256[] memory){
        return purchaseByUser[user];
    }

    function setFeePercentage(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Fee cannot be more than 100%");
        feePercentage = newFee;
    }

    function getListingsByUser (address user) external view returns(uint256[] memory){
        return userListings[user];
    }
}