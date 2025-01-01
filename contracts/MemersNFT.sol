// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract MemersNft is ERC721Enumerable {
    constructor () ERC721("MemersNFT", "MNFT") {}

    function mint() public {
        _safeMint(msg.sender, totalSupply());
    }
}