const BcPLCRVoting = artifacts.require('./BcPlcrVoting.sol');
const PLCRVoting = artifacts.require('./plcrvoting/PLCRVoting.sol');
const EIP20 = artifacts.require('tokens/eip20/EIP20.sol');
const DLL = artifacts.require("dll/DLL.sol");
const AttributeStore = artifacts.require("attrstore/AttributeStore.sol");

module.exports = (deployer, network, accounts) => {
  deployer.deploy(DLL);
  deployer.deploy(AttributeStore);

  deployer.link(DLL, BcPLCRVoting);
  deployer.link(AttributeStore, BcPLCRVoting);
  // deployer.link(DLL, [BcPLCRVoting, PLCRVoting]);
  // deployer.link(AttributeStore, [BcPLCRVoting, PLCRVoting]);

  if (network === 'test' || network === 'coverage') {  
    let plcr;
    let token;

    deployer.deploy(
      EIP20,
      '10000',
      'TestToken',
      '0',
      'TEST',
    )
      .then(() => deployer.deploy(
        BcPLCRVoting,
        EIP20.address,
      ))
      .then(() => BcPLCRVoting.deployed())
      .then((_plcr) => {
        plcr = _plcr;
      })
      .then(() => plcr.token.call())
      .then((_token) => {
        token = EIP20.at(_token);
      })
      .then(() => Promise.all(
        accounts.map(async (user) => {
          await token.transfer(user, 1000);
          await token.approve(plcr.address, 900, { from: user });
        }),
      ));
  } else {
    deployer.deploy(BcPLCRVoting, "0x0");
  }
};
