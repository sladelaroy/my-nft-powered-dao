import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import './App.css';
import MemersDAO from './contracts/MemersDAO.json'; // Adjust the path as needed

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
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
          const networkData = MemersDAO.networks[networkId];
          if (networkData) {
            const contract = new web3.eth.Contract(MemersDAO.abi, networkData.address);
            setContract(contract);

            const numProposals = await contract.methods.numProposals().call();
            setNumProposals(numProposals);

            const proposals = [];
            for (let i = 0; i < numProposals; i++) {
              const proposal = await contract.methods.proposals(i).call();
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
    if (contract) {
      await contract.methods.createProposal(proposalDescription).send({ from: account });
      const numProposals = await contract.methods.numProposals().call();
      setNumProposals(numProposals);

      const proposals = [];
      for (let i = 0; i < numProposals; i++) {
        const proposal = await contract.methods.proposals(i).call();
        proposals.push(proposal);
      }
      setProposals(proposals);
    }
  };

  const voteOnProposal = async (proposalId, vote) => {
    if (contract) {
      await contract.methods.voteOnProposal(proposalId, vote).send({ from: account });
      const proposals = [];
      for (let i = 0; i < numProposals; i++) {
        const proposal = await contract.methods.proposals(i).call();
        proposals.push(proposal);
      }
      setProposals(proposals);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Account: {account}</p>
        <p>Number of Proposals: {numProposals}</p>
        <input
          type="text"
          value={proposalDescription}
          onChange={(e) => setProposalDescription(e.target.value)}
          placeholder="Proposal Description"
        />
        <button onClick={createProposal}>Create Proposal</button>
        <div>
          {proposals.map((proposal, index) => (
            <div key={index}>
              <p>Proposal {index}: {proposal.description}</p>
              <button onClick={() => voteOnProposal(index, true)}>Vote Yes</button>
              <button onClick={() => voteOnProposal(index, false)}>Vote No</button>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
