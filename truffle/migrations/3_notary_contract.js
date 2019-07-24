var NotaryContract = artifacts.require("VaultNotary");

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
    deployer.deploy(NotaryContract);
};