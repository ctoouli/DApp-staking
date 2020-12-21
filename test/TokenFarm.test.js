// const { assert } = require('chai');
// const { it } = require('react-bootstrap/lib/Breadcrumb');
// const _deploy_contracts = require('../migrations/2_deploy_contracts');

const { assert } = require('chai');

const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'Ether');
}

contract('TokenFarm', ([owner, investor]) => {

    let daiToken, dappToken, tokenFarm

    before(async () => {
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        // Transfer all dapp tokens to TokenFarm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'));

        await daiToken.transfer(investor, tokens('100'), {from: owner})
    })

    // Write tests here...
    describe('Mock Dai deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })

    })

    describe('Farming tokens', async () => {
        it('rewards investors for staking dai tokens', async () => {
            let result 

            // Check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor dai wallet balance correct before staking')

            // Stake dai tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
            await tokenFarm.stakeTokens(tokens('100'), {from: investor})

            // Check staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor dai wallet balance correct after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'token farm dai balance correct after staking')
            
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

            // Issue Tokens
            await tokenFarm.issueTokens({from: owner })

            // Check balances after issuing tokes
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor dapp token wallet balance correct after issuing tokens')
        
            await tokenFarm.issueTokens({from: investor }).should.be.rejected

            // Unstake tokens
            await tokenFarm.unstakeTokens({from: investor })

            // Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor dai balance correct after unstaking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'token farm dai balance correct after unstaking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after unstaking')
        })
    })
})