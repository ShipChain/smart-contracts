<p align="center">
  <img src="https://shipchain.io/img/logo.png" alt="ShipChain"/>
</p>

[![CircleCI](https://img.shields.io/circleci/project/github/ShipChain/smart-contracts/master.svg)](https://circleci.com/gh/ShipChain/smart-contracts/tree/master)
[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)
[![Code style: solhint](https://img.shields.io/badge/code_style-solhint-ff69b4.svg?style=svg)](https://github.com/protofire/solhint)
[![Chat](https://img.shields.io/badge/gitter-ShipChain/lobby-green.svg)](https://gitter.im/ShipChain/Lobby)

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

```shell
wget -O ganache.AppImage https://github.com/trufflesuite/ganache/releases/download/v1.3.0/ganache-1.3.0-x86_64.AppImage
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

1. Run `bin/dc build`.

2. Run `bin/ddo yarn` to install the required packages.

3. Run a ganache instance.

+ CLI

    Run dockerized ganache in daemon mode

    `bin/dc up -d ganache`

    Then your Truffle commands will be run with 

    `bin/truffle <migrate|console|test>`

+ GUI

    Run Ganache locally on your host computer.  In the settings, listen for connections on all interfaces.

    Then your Truffle commands will be run with

    `bin/truffle --network gui <migrate/console/test>`

    Or the shortcut script

    `bin/truffle-gui <migrate/console/test>`
    

## Compile

After making changes to the contracts, compile them with

`bin/truffle[-gui] compile`

## Deploy

After compiling, deploy the latest version of the contracts with

`bin/truffle[-gui] migrate --reset`

Using the `--reset` option will redeploy all contracts instead of only deploying new migrations defined in the `truffle/migrations` directory.
This is best for ongoing development as you can deploy new versions of the contracts without making a new migration file every time.

## Console

To manually invoke the contract methods in your local network, use the truffle console (a NodeJS REPL). To enter the console, use `bin/truffle console`.  Here is an example of creating a new LoadShipment using the current LoadRegistry contract and returning the LoadShipment's Shipper:

```javascript
// Get the network accounts
var accounts;
web3.eth.getAccounts(function(err,res) { accounts = res; });

// Capture the deployed LoadRegistry
var registry;
LoadRegistry.deployed().then(d => {registry = d;});

// Alternately, if you know the deployed address you can use:
// var registry = LoadRegistry.at("<deployed_address>");

// Create a shipment (using LoadShipment constructor) and save it in the registry
registry.createNewShipment("<UUID>");

// Load the shipment from the address returned by the registry
var newAddr;
registry.getShipment("<UUID>").then(a => {newAddr = a;});
var shipment = LoadShipment.at(newAddr);

// Interact with the specific instance of the LoadShipment
shipment.getShipper();
shipment.setCarrier(accounts[1]);
```

Exit the truffle console with `.exit`

## Testing


Unit test with `bin/truffle test` (no need to run the compile and deploy
commands first. They are included in the`bin/truffle test`.)

Static Code Analysis with `bin/myth`

If you start getting errors similar to this:

```
Error: sender doesn't have enough funds to send tx. 
The upfront cost is: 672197500000000000 and the
sender's account only has: 663666560000000000
```

then you need to restart your Ganache as you have run out of ETH.  If you are testing with `bin/truffle` then use `bin/dc down`.  If you are testing with `bin/truffle-gui` then restart the Ganache application.


Before testing or pushing your revisions to the git repository, you may want to
run the linter by `bin/ddo npm run lint`, or `circleci local execute --job
solhint`, to prevent the linter breaking your build in circleci build. Or, if you
lint in your mind, skip this step. : )

If you need to test with a single test file, you can do that by `bin/truffle test test/TEST_FILE_NAME.js`

## Style Convention

The inline documentation of the solidity source files in this project follows the [NATSpec Format](https://solidity.readthedocs.io/en/v0.5.10/natspec-format.html).

## Local Security Check
To run `securify` locally, you can run this command,
```bash
bin/ddo npm run flatten
docker run -v $(pwd)/truffle/flat-sol:/project shipchain/securify:aef12a32
```

If you want to run `myth` locally, you can run,
```bash
bin/myth
```
However, make sure you have done the first two steps of the [Startup section](#startup).

## Local Coverage Test
To run coverage test locally,
```bash
bin/ddo npm run coverage
```

## Solidity docgen
To generate the markdown documentation for the NatSpec inline documentation,
```bash
bin/ddo npm run flatten
bin/ddo npm run docgen
```
The output file is `truffle/docs/index.md`

## Documentation

[Mermaid](https://mermaidjs.github.io/) charts in development in `truffle/LoadContract.html`.

[Live Editor](https://mermaidjs.github.io/mermaid-live-editor) is available.

## Helpful Links

### Solidity

 - Best Practices: [https://consensys.github.io/smart-contract-best-practices/](https://consensys.github.io/smart-contract-best-practices/)
 - Code Style: [https://solidity.readthedocs.io/en/latest/style-guide.html](https://solidity.readthedocs.io/en/latest/style-guide.html)
 - Design Patterns: [https://fravoll.github.io/solidity-patterns/](https://fravoll.github.io/solidity-patterns/)
 - Proxy Patterns: [https://blog.zeppelinos.org/proxy-patterns/](https://blog.zeppelinos.org/proxy-patterns/)
 - Security: [https://solidity.readthedocs.io/en/develop/security-considerations.html](https://solidity.readthedocs.io/en/develop/security-considerations.html)
 - Reusable Contracts: From [openzeppelin.org](https://openzeppelin.org/) - [https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts)
 - Longform Example: [https://learnxinyminutes.com/docs/solidity/](https://learnxinyminutes.com/docs/solidity/)
 - Modifiers: [https://ethereumdev.io/better-readability-with-modifiers/](https://ethereumdev.io/better-readability-with-modifiers/)
 - FAQs: [https://solidity.readthedocs.io/en/latest/frequently-asked-questions.html](https://solidity.readthedocs.io/en/latest/frequently-asked-questions.html)

### Truffle

 - Migrations: [https://truffleframework.com/docs/truffle/getting-started/running-migrations](https://truffleframework.com/docs/truffle/getting-started/running-migrations)
 - Writing Tests: [https://truffleframework.com/docs/truffle/testing/testing-your-contracts](https://truffleframework.com/docs/truffle/testing/testing-your-contracts)
 - Console: [https://truffleframework.com/docs/truffle/getting-started/using-truffle-develop-and-the-console#features](https://truffleframework.com/docs/truffle/getting-started/using-truffle-develop-and-the-console#features)
 - Alternate?: [https://docs.zeppelinos.org/docs/start.html](https://docs.zeppelinos.org/docs/start.html)

## Authors

* **Lucas Clay** - [mlclay](https://github.com/mlclay)
* **Adam Hodges** - [ajhodges](https://github.com/ajhodges)
* **Leeward Bound** - [leewardbound](https://github.com/leewardbound)
* **Jianwei Liu** - [jianwel](https://github.com/jianwel)



 - Inspiration taken from [LePetitBloc/truffle-docker](https://github.com/LePetitBloc/truffle-docker)