// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IDemoNFTMarketplace {
    
    function getPrice() external view returns (uint);

   
    function available(uint _tokenId) external view returns (bool);

   
    function purchase(uint _tokenId) external payable;
}


interface IMemersNFT {

    function balanceOf(address owner) external view returns (uint);


    function tokenOfOwnerByIndex(address owner, uint index)
        external
        view
        returns (uint);
}

contract MemersDAO is Ownable {

    
       
    struct Proposal {
       
        uint nftTokenId;
       
        uint deadline;
       
        uint yayVotes;
       
        uint nayVotes;
       
        bool executed;
       
        mapping(uint => bool) voters;
    }

    mapping(uint => Proposal) public proposals;
    uint public numProposals;

    IDemoNFTMarketplace nftMarketplace;
    IMemersNFT memersNFT;

    enum Vote {
        YAY,
        NAY 
    }

    constructor(address _nftMarketplace, address _cryptoDevsNFT) Ownable(msg.sender) payable {
        nftMarketplace = IDemoNFTMarketplace(_nftMarketplace);
        memersNFT = IMemersNFT(_cryptoDevsNFT);
    }

    modifier nftHolderOnly() {
        require(memersNFT.balanceOf(msg.sender) > 0, "NOT_A_DAO_MEMBER");
        _;
    }

    modifier activeProposalOnly(uint proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "DEADLINE_EXCEEDED"
        );
        _;
    }

    modifier inactiveProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline <= block.timestamp,
            "DEADLINE_NOT_EXCEEDED"
        );
        require(
            proposals[proposalIndex].executed == false,
            "PROPOSAL_ALREADY_EXECUTED"
        );
        _;
    }

    function createProposal(uint _nftTokenId)
        external
        nftHolderOnly
        returns (uint)
        {
        require(nftMarketplace.available(_nftTokenId), "NFT_NOT_FOR_SALE");
        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = _nftTokenId;
  
        proposal.deadline = block.timestamp + 5 minutes;

        numProposals++;

        return numProposals - 1;
    }

    function voteOnProposal(uint proposalIndex, Vote vote)
        external
        nftHolderOnly
        activeProposalOnly(proposalIndex)
    {
        Proposal storage proposal = proposals[proposalIndex];

        uint voterNFTBalance = memersNFT.balanceOf(msg.sender);
        uint numVotes = 0;

        for (uint i = 0; i < voterNFTBalance; i++) {
            uint tokenId = memersNFT.tokenOfOwnerByIndex(msg.sender, i);
            if (proposal.voters[tokenId] == false) {
                numVotes++;
                proposal.voters[tokenId] = true;
            }
        }
        require(numVotes > 0, "ALREADY_VOTED");

        if (vote == Vote.YAY) {
            proposal.yayVotes += numVotes;
        } else {
            proposal.nayVotes += numVotes;
        }
    }

    function executeProposal(uint256 proposalIndex)
        external
        nftHolderOnly
        inactiveProposalOnly(proposalIndex)
    {
        Proposal storage proposal = proposals[proposalIndex];

        if (proposal.yayVotes > proposal.nayVotes) {
            uint256 nftPrice = nftMarketplace.getPrice();
            require(address(this).balance >= nftPrice, "NOT_ENOUGH_FUNDS");
            nftMarketplace.purchase{value: nftPrice}(proposal.nftTokenId);
        }
        proposal.executed = true;
    }

    function withdrawEther() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw, contract balance empty");
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "FAILED_TO_WITHDRAW_ETHER");
    }

    receive() external payable {}

    fallback() external payable {}


}