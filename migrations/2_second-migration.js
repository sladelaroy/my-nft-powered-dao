const MemersNFT = artifacts.require('MemersNFT');
const MemersDAO  = artifacts.require('MemersDAO');
const DemoNFTMarketplace = artifacts.require('DemoNFTMarketplace')
// require("dotenv").config({path: '../.env'})
// console.log(process.env)


module.exports = async function(deployer) {
  let accounts = await web3.eth.getAccounts();
  await deployer.deploy(MemersNFT);
  await deployer.deploy(DemoNFTMarketplace);
  await deployer.deploy(MemersDAO, DemoNFTMarketplace.address, MemersNFT.address);
 
};
