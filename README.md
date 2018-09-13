<p align="center">
  <img src="https://shipchain.io/img/logo.png" alt="ShipChain"/>
</p>

# ShipChain Smart Contracts

A Truffle + Ganache environment for developing, testing, deploying smart contracts.

## Prerequisites

### Docker

Development is handled via multiple Docker containers.  Deployment of these containers is handled through the use of Docker Compose with the provided files in the `compose` directory.

See the official Docker documentation for installation information:

 - [Install Docker](https://docs.docker.com/engine/installation/)
 - [Install Docker Compose](https://docs.docker.com/compose/install/) version > 1.21.0

### Ganache Gui

If you want to visualize the blockchain as you're developing the contracts, download [Ganache](https://truffleframework.com/ganache).  I had issues getting the AppImage to work properly un Ubunutu Bionic.  The solution was to create portable AppImage directories next to the executable.

```
wget -O ganache.AppImage https://github.com/trufflesuite/ganache/releases/download/v1.2.2/ganache-1.2.2-x86_64.AppImage
chmod a+x ganache.AppImage
mkdir ganache.AppImage.home
mkdir ganache.AppImage.config
./ganache.AppImage
``` 

## Scripts

 - `bin/dc` ShipChain docker-compose wrapper.  This injects the Host computer's internal Docker IP in to the containers for external connectivity (used for connecting to Host's Ganache Gui).
 - `bin/ddo` Runs a command in the Truffle container **as your current user**.  This allows any generated files to be modifiable locally without changing ownership or permissions.
 - `bin/truffle` Shortcut to run Truffle commands directly
   - `compile` Compiles the Solidity
   - `migrate` Deploys to the local Ganache docker container.  This can be extended with later with a `--network` parameter to deploy to another defined node.
   - `console` Start an interactive Truffle console to execute methods in a contract.
   - `test` Run Solidity and JavaScript tests in the `truffle/tests` directory.
 - `bin/truffle-gui` Same as the above, but specifies `--network gui` for migration, testing, and console interaction.  Be aware of which network you've deployed code to when you're testing.
 - `bin/myth` Run Mythril [static code analysis](https://github.com/ConsenSys/mythril/wiki/Mythril-Detection-Capabilities) against the contracts.  This compiles the contracts prior to the analysis.

## Startup

### CLI

Run dockerized ganache in daemon mode

`bin/dc up -d ganache`

Then run your Truffle commands with

`bin/truffle <compile|migrate|console|test>`

### GUI

Run Ganache locally on your host computer.  In the settings, listen for connections on all interfaces.

Then run your Truffle commands with 

`bin/truffle --network gui <compile/migrat/console/test>`

Or with the shortcut script

`bin/truffle-gui`

## Testing

Unit test with `bin/truffle test`

Static Code Analysis with `bin/myth`

## Helpful Links

### Solidity

 - Best Practices: [https://consensys.github.io/smart-contract-best-practices/](https://consensys.github.io/smart-contract-best-practices/)
 - Code Style: [https://solidity.readthedocs.io/en/latest/style-guide.html](https://solidity.readthedocs.io/en/latest/style-guide.html)
 - Security: [https://solidity.readthedocs.io/en/develop/security-considerations.html](https://solidity.readthedocs.io/en/develop/security-considerations.html)
 - Reusable Contracts: From [openzeppelin.org](https://openzeppelin.org/) - [https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts)
 - Longform Example: [https://learnxinyminutes.com/docs/solidity/](https://learnxinyminutes.com/docs/solidity/)
 - Modifiers: [https://ethereumdev.io/better-readability-with-modifiers/](https://ethereumdev.io/better-readability-with-modifiers/)
 - FAQs: [https://solidity.readthedocs.io/en/latest/frequently-asked-questions.html](https://solidity.readthedocs.io/en/latest/frequently-asked-questions.html)

### Truffle

 - Migrations: [https://truffleframework.com/docs/truffle/getting-started/running-migrations](https://truffleframework.com/docs/truffle/getting-started/running-migrations)
 - Writing Tests: [https://truffleframework.com/docs/truffle/testing/testing-your-contracts](https://truffleframework.com/docs/truffle/testing/testing-your-contracts)
 - Console: [https://truffleframework.com/docs/truffle/getting-started/using-truffle-develop-and-the-console#features](https://truffleframework.com/docs/truffle/getting-started/using-truffle-develop-and-the-console#features)

## Authors

* **Lucas Clay** - [mlclay](https://github.com/mlclay)
* **Adam Hodges** - [ajhodges](https://github.com/ajhodges)
* **Leeward Bound** - [leewardbound](https://github.com/leewardbound)



 - Inspiration taken from [LePetitBloc/truffle-docker](https://github.com/LePetitBloc/truffle-docker)