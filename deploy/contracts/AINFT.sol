// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AINFT is Ownable, ERC721URIStorage {
    uint256 public tokenCount;
    uint256 public mintingWindow = 1 days;
    mapping(address => uint256) public lastMintTimestamp;

    mapping(address => bool) public allowedMinters;
    mapping(address => uint256) public mintLimit;
    mapping(address => uint256[]) private _ownerTokens;

    constructor() ERC721("AI Art NFT", "AINFT") Ownable(msg.sender) {}

    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event Received(address sender, uint amount);

    modifier onlyMinter(){
        require(msg.sender == owner() || allowedMinters[msg.sender], "Not allowed to mint");
        _;
    }

    function setAllowedMinter(address minter, bool allowed) external onlyOwner {
        allowedMinters[minter] = allowed;
    }

    function adminMint(address to, string memory tokenURI) public onlyOwner returns (uint256) {
        tokenCount++;
        uint256 tokenId = tokenCount;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        _ownerTokens[to].push(tokenId);
        emit Minted(to, tokenId, tokenURI);
        return tokenId;
    }

    function mintNFT(string memory tokenURI) public onlyMinter returns (uint256) {
        require(mintLimit[msg.sender] < 5, "Mint limit reached");
        require(block.timestamp >= lastMintTimestamp[msg.sender] + mintingWindow, "Minting window not reached yet");

        lastMintTimestamp[msg.sender] = block.timestamp;

        tokenCount++;
        uint256 newTokenId = tokenCount;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        _ownerTokens[msg.sender].push(newTokenId);

        mintLimit[msg.sender]++;

        emit Minted(msg.sender, newTokenId, tokenURI);

        return newTokenId;
    }

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");

        _removeTokenFromOwnerEnumeration(msg.sender, tokenId);
        _burn(tokenId);
    }

    function resetMintTimestamp(address user) external onlyOwner {
        lastMintTimestamp[user] = 0;
    }

    function getTokensByOwner(address owner) external view returns(uint256[] memory){
        return _ownerTokens[owner];
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function _removeTokenFromOwnerEnumeration(address owner, uint256 tokenId) internal{
        uint256[] storage tokens = _ownerTokens[owner];

        for(uint256 i =0; i < tokens.length; i++){
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
