const expect = require('expect');
const WalletProvider = require('truffle-wallet-provider');
const Wallet = require('ethereumjs-wallet');
const { promisify } = require('util');
const Eth = require('ethjs-query');
const BigNumber = require('bignumber.js');

const ShortThingFactory = artifacts.require('./ShortThingFactory.sol');
const ThingFactory = artifacts.require('./ThingFactory.sol');
const Thing = artifacts.require('./Thing.sol');
const TestRevertPayload = artifacts.require('./TestRevertPayload.sol');

contract('CloneFactory', async (accounts) => {
  var global;
  var factory;

  const initFactory = async (contract) => {
    var _factory = await contract.new(global.address)
    factory = {
      address: global.address,
      cloneCost: () => {
        return _factory.onlyCreate().then(tx => tx.receipt.gasUsed)
      },
      createThing: (name, value) => {
        return _factory.createThing(name, value)
          .then(tx => {
            return Thing.at(tx.logs[0].args.newThingAddress);
          })
      },
      isThing: (addr) => {
        return _factory.isThing(addr)
      },
      incrementThings: (arr) => _factory.incrementThings(arr)
    }
  };

  describe('Regular CloneFactory', async () => {
    before(async () => {
      global = await Thing.new();
      await initFactory(ThingFactory);
    })

    it('should be cheap', async () => {
      return await factory.cloneCost()
        .then(cost => {
          console.log("Clone cost: " + cost);
          expect(+cost).toBeLessThan(70000)
        })
    })

    it('should work', async () => {
      return factory.createThing("Fred", 233)
        .then(thing => {
          return Promise.resolve()
            .then(() => thing.value())
            .then(value => expect(+value).toBe(233))
            .then(() => thing.name())
            .then(name => expect(name).toBe('Fred'))
            .then(() => factory.isThing(thing.address))
            .then(value => expect(value).toBe(true))
            .then(() => factory.isThing(factory.address))
            .then(value => expect(value).toBe(false))
        })
        .then(() => global.name())
        .then(value => expect(value).toBe('master'))
        .then(() => global.value())
        .then(value => expect(+value).toBe(0));
    })

    it('should revert with payload', async () => {
      var reverter = await TestRevertPayload.new();
      var thing = await factory.createThing("Fred", 233);
      var result = await reverter.getRevertMessage(thing.address);
      expect(result.logs[0].args.message).toBe("Hello world!");
    })

    it('should be cheap to use', async () => {
      var thing = await factory.createThing("Fred", "345");
      var naked = await global.doit();
      var result = await thing.doit();
      var cost = result.receipt.gasUsed - naked.receipt.gasUsed;
      console.log("COST: " + cost);
      expect(cost).toBe(763);
    });

    it('should work many times', async () => {
      var thing1 = await factory.createThing("Fred", "345");
      var thing2 = await factory.createThing("Bob", "456");
      await factory.incrementThings([thing1.address, thing2.address]);
    })
  });

  describe("ShortCloneFactory", async () => {

    before(async () => {
      global = await Thing.new({ from: accounts[1], nonce: 0 })
      await initFactory(ShortThingFactory);
    })

    it('should be cheap', async () => {
      return factory.cloneCost()
        .then(cost => {
          console.log("Clone cost: " + cost);
          expect(+cost).toBeLessThan(70000)
        })
    })

    it('should work', async () => {
      return factory.createThing("Fred", 233)
        .then(thing => {
          return Promise.resolve()
            .then(() => thing.value())
            .then(value => expect(+value).toBe(233))
            .then(() => thing.name())
            .then(name => expect(name).toBe('Fred'))
            .then(() => factory.isThing(thing.address))
            .then(value => expect(value).toBe(true))
            .then(() => factory.isThing(factory.address))
            .then(value => expect(value).toBe(false))
        })
        .then(() => global.name())
        .then(value => expect(value).toBe('master'))
        .then(() => global.value())
        .then(value => expect(+value).toBe(0));
    })
  })
})