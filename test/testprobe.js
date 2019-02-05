const expect = require('expect');
const WalletProvider = require('truffle-wallet-provider');
const Wallet = require('ethereumjs-wallet');
const { promisify } = require('util');
const Eth = require('ethjs-query');

const ShortThingFactory = artifacts.require('./ShortThingFactory.sol');
const ThingFactory = artifacts.require('./ThingFactory.sol');
const Thing = artifacts.require('./Thing.sol');
const ContractProbe = artifacts.require('./ContractProbe.sol');

contract("ContractProbe", async (accounts) => {

    describe("FullLengthClone", async () => {
        var master;
        var factory;
        var clone;
        var probe;

        before(async () => {
            master = await Thing.new();
            factory = await ThingFactory.new(master.address);
            clone = await factory.createThing("fred", 12).then(tx => Thing.at(tx.logs[0].args.newThingAddress))
            probe = await ContractProbe.new();
        })

        it('should work', async () => {
            const { isContract, forwardedTo } = await probe.probe(master.address);
            expect(isContract).toBe(true);
            expect(forwardedTo).toBe(master.address);
        })

        it('should work with a clone', async () => {
            const { isContract, forwardedTo } = await probe.probe(clone.address);
            expect(isContract).toBe(true);
            expect(forwardedTo).toBe(master.address);
        })

        it('should work with a regular address', async () => {
            const { isContract, forwardedTo } = await probe.probe('0xA4caDe6ecbed8f75F6fD50B8be92feb144400CC4');
            expect(isContract).toBe(false);
            expect(forwardedTo).toBe(web3.utils.toChecksumAddress('0xA4caDe6ecbed8f75F6fD50B8be92feb144400CC4'))//.toLowerCase());
        })
    })

    describe("ShortCloneFactory", async () => {
        var master;
        var factory;
        var clone;
        var probe;

        before(async () => {
            master = await Thing.new({ from: accounts[1], nonce: 0 })
            factory = await ShortThingFactory.new(master.address);
            clone = await factory.createThing("fred", 12).then(tx => Thing.at(tx.logs[0].args.newThingAddress))
            probe = await ContractProbe.new();
        })

        it('should work', async () => {
            const { isContract, forwardedTo } = await probe.probe(master.address);
            expect(isContract).toBe(true);
            expect(forwardedTo).toBe(master.address);
        })

        it('should work with a clone', async () => {
            const { isContract, forwardedTo } = await probe.probe(clone.address);
            expect(isContract).toBe(true);
            expect(forwardedTo).not.toBe(clone.address);
            expect(forwardedTo).toBe(master.address);
        })

        it('should work with a regular address', async () => {
            const { isContract, forwardedTo } = await probe.probe('0xA4caDe6ecbed8f75F6fD50B8be92feb144400CC4');
            expect(isContract).toBe(false);
            expect(forwardedTo).toBe(web3.utils.toChecksumAddress('0xA4caDe6ecbed8f75F6fD50B8be92feb144400CC4'))//.toLowerCase());
        })
    })
})
