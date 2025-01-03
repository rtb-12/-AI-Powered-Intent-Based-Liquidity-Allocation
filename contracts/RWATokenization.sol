// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateToken is ERC1155, Ownable {
    struct TokenInfo {
        uint256 tokenId;
        uint256 amount;
        string tokenURI;
    }

    mapping(uint256 => string) private _tokenURIs;
    mapping(address => TokenInfo[]) private _mintedTokensByAddress;
    mapping(uint256 => address) private _tokenCreators;
    uint256 private _currentTokenId;

    event TokenMinted(uint256 indexed tokenId, uint256 amount, address indexed recipient);
    event TokenBurned(uint256 indexed tokenId, uint256 amount, address indexed owner);
    event TokenURIUpdated(uint256 indexed tokenId, string newURI);

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mintToken(
        uint256 amount,
        string memory tokenURI,
        address recipient
    ) external onlyOwner returns (uint256) {
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(tokenURI).length > 0, "URI cannot be empty");

        uint256 tokenId = _currentTokenId;
        _currentTokenId++;

        _mint(recipient, tokenId, amount, "");
        _tokenURIs[tokenId] = tokenURI;
        _tokenCreators[tokenId] = msg.sender;

        _mintedTokensByAddress[recipient].push(TokenInfo({
            tokenId: tokenId,
            amount: amount,
            tokenURI: tokenURI
        }));

        emit TokenMinted(tokenId, amount, recipient);
        return tokenId;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function burnToken(uint256 tokenId, uint256 amount) external {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance to burn");
        _burn(msg.sender, tokenId, amount);

        TokenInfo[] storage tokens = _mintedTokensByAddress[msg.sender];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i].tokenId == tokenId) {
                if (tokens[i].amount > amount) {
                    tokens[i].amount -= amount;
                } else {
                    tokens[i] = tokens[tokens.length - 1];
                    tokens.pop();
                }
                break;
            }
        }

        emit TokenBurned(tokenId, amount, msg.sender);
    }

    function updateTokenURI(uint256 tokenId, string memory newURI) external onlyOwner {
        require(bytes(newURI).length > 0, "URI cannot be empty");
        _tokenURIs[tokenId] = newURI;
        emit TokenURIUpdated(tokenId, newURI);
    }

    function getMintedTokensByAddress(address user) external view returns (TokenInfo[] memory) {
        return _mintedTokensByAddress[user];
    }

    function getTokenCreator(uint256 tokenId) external view returns (address) {
        return _tokenCreators[tokenId];
    }

    function getAllMintedTokens() external view returns (TokenInfo[] memory) {
        uint256 totalTokens = _currentTokenId;
        TokenInfo[] memory allTokens = new TokenInfo[](totalTokens);
        for (uint256 i = 0; i < totalTokens; i++) {
            allTokens[i] = TokenInfo({
                tokenId: i,
                amount: balanceOf(_tokenCreators[i], i),
                tokenURI: _tokenURIs[i]
            });
        }
        return allTokens;
    }
}
