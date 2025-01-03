import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';
import MemersDAO from './contracts/MemersDAO.json';
import MemersNFT from './contracts/MemersNft.json';

function App() {
  const [account, setAccount] = useState('');
  const [daoContract, setDaoContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [numProposals, setNumProposals] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [proposalDescription, setProposalDescription] = useState('');

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        setWeb3(web3);

        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3.eth.net.getId();
          const daoNetworkData = MemersDAO.networks[networkId];
          const nftNetworkData = MemersNFT.networks[networkId];
          if (daoNetworkData && nftNetworkData) {
            const daoContract = new web3.eth.Contract(MemersDAO.abi, daoNetworkData.address);
            setDaoContract(daoContract);

            const nftContract = new web3.eth.Contract(MemersNFT.abi, nftNetworkData.address);
            setNftContract(nftContract);

            const numProposals = await daoContract.methods.numProposals().call();
            setNumProposals(numProposals);

            const proposals = [];
            for (let i = 0; i < numProposals; i++) {
              const proposal = await daoContract.methods.proposals(i).call();
              proposals.push(proposal);
            }
            setProposals(proposals);
          } else {
            window.alert('Smart contract not deployed to detected network.');
          }
        } catch (error) {
          console.error('Error requesting accounts:', error);
          window.alert('Error requesting accounts. Please check the console for more details.');
        }
      } else {
        window.alert('Please install MetaMask!');
      }
    }

    loadBlockchainData();
  }, []);

  const createProposal = async () => {
    if (daoContract) {
      await daoContract.methods.createProposal(proposalDescription).send({ from: account });
      const numProposals = await daoContract.methods.numProposals().call();
      setNumProposals(numProposals);

      const proposals = [];
      for (let i = 0; i < numProposals; i++) {
        const proposal = await daoContract.methods.proposals(i).call();
        proposals.push(proposal);
      }
      setProposals(proposals);
    }
  };

  const voteOnProposal = async (proposalId, vote) => {
    if (daoContract) {
      await daoContract.methods.voteOnProposal(proposalId, vote).send({ from: account });
      const proposals = [];
      for (let i = 0; i < numProposals; i++) {
        const proposal = await daoContract.methods.proposals(i).call();
        proposals.push(proposal);
      }
      setProposals(proposals);
    }
  };

  const mintNFT = async () => {
    if (nftContract) {
      await nftContract.methods.mint().send({ from: account });
      window.alert('NFT minted successfully!');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Account: {account}</p>
        <p>Number of Proposals: {numProposals}</p>
        <button onClick={mintNFT}>Mint NFT</button>
        <input
          type="text"
          value={proposalDescription}
          onChange={(e) => setProposalDescription(e.target.value)}
          placeholder="Enter Token_Id e.g: '1' "
        />
        <button onClick={createProposal}>Create Proposal</button>
        <div>
          {proposals.map((proposal, index) => (
            <div key={index}>
              <p>Proposal {index}: {proposal.description}</p>
              <button onClick={() => voteOnProposal(index, 0)}>Vote Yes</button>
              <button onClick={() => voteOnProposal(index, 1)}>Vote No</button>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;







