// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateToken is ERC1155, Ownable {
    mapping(uint256 => string) private _tokenURIs;
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

        emit TokenMinted(tokenId, amount, recipient);
        return tokenId;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function burnToken(uint256 tokenId, uint256 amount) external {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance to burn");
        _burn(msg.sender, tokenId, amount);
        emit TokenBurned(tokenId, amount, msg.sender);
    }

    function updateTokenURI(uint256 tokenId, string memory newURI) external onlyOwner {
        require(bytes(newURI).length > 0, "URI cannot be empty");
        _tokenURIs[tokenId] = newURI;
        emit TokenURIUpdated(tokenId, newURI);
    }
}