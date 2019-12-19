var ProfileContract = artifacts.require("ERC725");

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
    deployer.deploy(ProfileContract);
};