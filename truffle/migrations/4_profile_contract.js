//var ERC725 = artifacts.require("ERC725");
//var ERC735 = artifacts.require("ERC735");
//var KeyHolder = artifacts.require("KeyHolder");
//var ClaimHolder = artifacts.require("ClaimHolder");
var ClaimVerifier = artifacts.require("ClaimVerifier");

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
    //deployer.deploy(ERC725);
    //deployer.deploy(ERC735);
    //deployer.deploy(KeyHolder);
    //deployer.deploy(ClaimHolder);
    deployer.deploy(ClaimVerifier);
};