/* eslint-disable no-undef */
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function (deployer, network, accounts) {
  // Deploy DappToken
  await deployer.deploy(DappToken);
  const dappToken = await DappToken.deployed();

  // Deploy dDaiToken
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

  // Deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed()

  // Transfer all dapp tokens to TokenFarm (1 million)
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

  // Transfer 100 dai tokens to an investor
  await daiToken.transfer(accounts[1], '100000000000000000000');
};
