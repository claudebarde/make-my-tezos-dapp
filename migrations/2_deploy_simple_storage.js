const { MichelsonMap } = require("@taquito/taquito");

const DemoContract = artifacts.require("DemoContract");

module.exports = (deployer) => {
  deployer.deploy(DemoContract, {
    integer: 0,
    message: "hello world",
    areyouthere: false,
    names: new MichelsonMap(),
  });
};
