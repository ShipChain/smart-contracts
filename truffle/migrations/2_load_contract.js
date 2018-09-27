var LoadContract = artifacts.require("LoadContract");

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
    deployer.deploy(LoadContract);
};