var ClaimHolder = artifacts.require("ClaimHolder");
var ClaimVerifier = artifacts.require("ClaimVerifier");

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
    deployer.deploy(ClaimHolder).then(() => {
        //print the address of the trustedClaimHolder if needed
       // console.log(ClaimHolder.address);
        deployer.deploy(ClaimVerifier(ClaimHolder.address));
    })
};