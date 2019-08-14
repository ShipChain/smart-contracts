[LoadContract]: #LoadContract
[LoadContract-notDeprecated--]: #LoadContract-notDeprecated--
[LoadContract-shipmentHasState-bytes16-enum-Shipment-State-string-]: #LoadContract-shipmentHasState-bytes16-enum-Shipment-State-string-
[LoadContract-escrowHasState-bytes16-enum-Escrow-State-string-]: #LoadContract-escrowHasState-bytes16-enum-Escrow-State-string-
[LoadContract-escrowHasType-bytes16-enum-Escrow-FundingType-string-]: #LoadContract-escrowHasType-bytes16-enum-Escrow-FundingType-string-
[LoadContract-shipmentExists-bytes16-]: #LoadContract-shipmentExists-bytes16-
[LoadContract-hasEscrow-bytes16-]: #LoadContract-hasEscrow-bytes16-
[LoadContract-canFund-bytes16-address-]: #LoadContract-canFund-bytes16-address-
[LoadContract-canRelease-bytes16-]: #LoadContract-canRelease-bytes16-
[LoadContract-canRefund-bytes16-]: #LoadContract-canRefund-bytes16-
[LoadContract-canWithdraw-bytes16-]: #LoadContract-canWithdraw-bytes16-
[Ownable-onlyOwner--]: #Ownable-onlyOwner--
[LoadContract-setDeprecated-bool-]: #LoadContract-setDeprecated-bool-
[LoadContract-setShipTokenContractAddress-address-]: #LoadContract-setShipTokenContractAddress-address-
[LoadContract-setEscrowRefundAddress-bytes16-address-]: #LoadContract-setEscrowRefundAddress-bytes16-address-
[LoadContract-createNewShipment-bytes16-enum-Escrow-FundingType-uint256-]: #LoadContract-createNewShipment-bytes16-enum-Escrow-FundingType-uint256-
[LoadContract-createNewShipment2-bytes16-enum-Escrow-FundingType-uint256-address-]: #LoadContract-createNewShipment2-bytes16-enum-Escrow-FundingType-uint256-address-
[LoadContract-setCarrier-bytes16-address-]: #LoadContract-setCarrier-bytes16-address-
[LoadContract-setModerator-bytes16-address-]: #LoadContract-setModerator-bytes16-address-
[LoadContract-setInProgress-bytes16-]: #LoadContract-setInProgress-bytes16-
[LoadContract-setComplete-bytes16-]: #LoadContract-setComplete-bytes16-
[LoadContract-setCanceled-bytes16-]: #LoadContract-setCanceled-bytes16-
[LoadContract-getShipmentData-bytes16-]: #LoadContract-getShipmentData-bytes16-
[LoadContract-getEscrowData-bytes16-]: #LoadContract-getEscrowData-bytes16-
[LoadContract-fundEscrowEther-bytes16-]: #LoadContract-fundEscrowEther-bytes16-
[LoadContract-receiveApproval-address-uint256-address-bytes-]: #LoadContract-receiveApproval-address-uint256-address-bytes-
[LoadContract-releaseEscrow-bytes16-]: #LoadContract-releaseEscrow-bytes16-
[LoadContract-withdrawEscrow-bytes16-]: #LoadContract-withdrawEscrow-bytes16-
[LoadContract-refundEscrow-bytes16-]: #LoadContract-refundEscrow-bytes16-
[Ownable-constructor--]: #Ownable-constructor--
[Ownable-owner--]: #Ownable-owner--
[Ownable-isOwner--]: #Ownable-isOwner--
[Ownable-renounceOwnership--]: #Ownable-renounceOwnership--
[Ownable-transferOwnership-address-]: #Ownable-transferOwnership-address-
[Ownable-_transferOwnership-address-]: #Ownable-_transferOwnership-address-
[LoadContract-ContractDeprecatedSet-address-bool-]: #LoadContract-ContractDeprecatedSet-address-bool-
[LoadContract-TokenContractAddressSet-address-address-]: #LoadContract-TokenContractAddressSet-address-address-
[LoadContract-EscrowRefundAddressSet-address-bytes16-address-]: #LoadContract-EscrowRefundAddressSet-address-bytes16-address-
[LoadContract-ShipmentCreated-address-bytes16-]: #LoadContract-ShipmentCreated-address-bytes16-
[LoadContract-ShipmentCarrierSet-address-bytes16-address-]: #LoadContract-ShipmentCarrierSet-address-bytes16-address-
[LoadContract-ShipmentModeratorSet-address-bytes16-address-]: #LoadContract-ShipmentModeratorSet-address-bytes16-address-
[LoadContract-ShipmentInProgress-address-bytes16-]: #LoadContract-ShipmentInProgress-address-bytes16-
[LoadContract-ShipmentComplete-address-bytes16-]: #LoadContract-ShipmentComplete-address-bytes16-
[LoadContract-ShipmentCanceled-address-bytes16-]: #LoadContract-ShipmentCanceled-address-bytes16-
[LoadContract-EscrowDeposited-address-bytes16-uint256-uint256-]: #LoadContract-EscrowDeposited-address-bytes16-uint256-uint256-
[LoadContract-EscrowFunded-address-bytes16-uint256-uint256-]: #LoadContract-EscrowFunded-address-bytes16-uint256-uint256-
[LoadContract-EscrowReleased-address-bytes16-uint256-]: #LoadContract-EscrowReleased-address-bytes16-uint256-
[LoadContract-EscrowRefunded-address-bytes16-uint256-]: #LoadContract-EscrowRefunded-address-bytes16-uint256-
[LoadContract-EscrowWithdrawn-address-bytes16-uint256-]: #LoadContract-EscrowWithdrawn-address-bytes16-uint256-
[LoadContract-EscrowCreated-address-bytes16-enum-Escrow-FundingType-uint256-uint256-]: #LoadContract-EscrowCreated-address-bytes16-enum-Escrow-FundingType-uint256-uint256-
[Ownable-OwnershipTransferred-address-address-]: #Ownable-OwnershipTransferred-address-address-
[Converter]: #Converter
[Converter-toBytes16-bytes-]: #Converter-toBytes16-bytes-
[Escrow]: #Escrow
[Escrow-getTimeoutDate-struct-Escrow-Data-]: #Escrow-getTimeoutDate-struct-Escrow-Data-
[Escrow-trackFunding-struct-Escrow-Data-bytes16-uint256-]: #Escrow-trackFunding-struct-Escrow-Data-bytes16-uint256-
[Escrow-releaseFunds-struct-Escrow-Data-bytes16-]: #Escrow-releaseFunds-struct-Escrow-Data-bytes16-
[Escrow-withdraw-struct-Escrow-Data-bytes16-]: #Escrow-withdraw-struct-Escrow-Data-bytes16-
[Escrow-refund-struct-Escrow-Data-bytes16-]: #Escrow-refund-struct-Escrow-Data-bytes16-
[Escrow-EscrowDeposited-address-bytes16-uint256-uint256-]: #Escrow-EscrowDeposited-address-bytes16-uint256-uint256-
[Escrow-EscrowFunded-address-bytes16-uint256-uint256-]: #Escrow-EscrowFunded-address-bytes16-uint256-uint256-
[Escrow-EscrowReleased-address-bytes16-uint256-]: #Escrow-EscrowReleased-address-bytes16-uint256-
[Escrow-EscrowRefunded-address-bytes16-uint256-]: #Escrow-EscrowRefunded-address-bytes16-uint256-
[Escrow-EscrowWithdrawn-address-bytes16-uint256-]: #Escrow-EscrowWithdrawn-address-bytes16-uint256-
[Shipment]: #Shipment
[Shipment-isShipper-struct-Shipment-Data-string-]: #Shipment-isShipper-struct-Shipment-Data-string-
[Shipment-setCarrier-struct-Shipment-Data-bytes16-address-]: #Shipment-setCarrier-struct-Shipment-Data-bytes16-address-
[Shipment-setModerator-struct-Shipment-Data-bytes16-address-]: #Shipment-setModerator-struct-Shipment-Data-bytes16-address-
[Shipment-setInProgress-struct-Shipment-Data-bytes16-]: #Shipment-setInProgress-struct-Shipment-Data-bytes16-
[Shipment-setComplete-struct-Shipment-Data-bytes16-]: #Shipment-setComplete-struct-Shipment-Data-bytes16-
[Shipment-setCanceled-struct-Shipment-Data-bytes16-]: #Shipment-setCanceled-struct-Shipment-Data-bytes16-
[Shipment-ShipmentCarrierSet-address-bytes16-address-]: #Shipment-ShipmentCarrierSet-address-bytes16-address-
[Shipment-ShipmentModeratorSet-address-bytes16-address-]: #Shipment-ShipmentModeratorSet-address-bytes16-address-
[Shipment-ShipmentInProgress-address-bytes16-]: #Shipment-ShipmentInProgress-address-bytes16-
[Shipment-ShipmentComplete-address-bytes16-]: #Shipment-ShipmentComplete-address-bytes16-
[Shipment-ShipmentCanceled-address-bytes16-]: #Shipment-ShipmentCanceled-address-bytes16-
[Migrations]: #Migrations
[Migrations-restricted--]: #Migrations-restricted--
[Migrations-constructor--]: #Migrations-constructor--
[Migrations-setCompleted-uint256-]: #Migrations-setCompleted-uint256-
[Migrations-upgrade-address-]: #Migrations-upgrade-address-
[VaultNotary]: #VaultNotary
[VaultNotary-canUpdateUri-bytes16-]: #VaultNotary-canUpdateUri-bytes16-
[VaultNotary-canUpdateHash-bytes16-]: #VaultNotary-canUpdateHash-bytes16-
[VaultNotary-vaultOwnerOnly-bytes16-]: #VaultNotary-vaultOwnerOnly-bytes16-
[VaultNotary-isNotRegistered-bytes16-]: #VaultNotary-isNotRegistered-bytes16-
[VaultNotary-isRegistered-bytes16-]: #VaultNotary-isRegistered-bytes16-
[VaultNotary-notDeprecated--]: #VaultNotary-notDeprecated--
[Ownable-onlyOwner--]: #Ownable-onlyOwner--
[VaultNotary-registerVault-bytes16-string-string-]: #VaultNotary-registerVault-bytes16-string-string-
[VaultNotary-setDeprecated-bool-]: #VaultNotary-setDeprecated-bool-
[VaultNotary-grantUpdateHashPermission-bytes16-address-]: #VaultNotary-grantUpdateHashPermission-bytes16-address-
[VaultNotary-revokeUpdateHashPermission-bytes16-address-]: #VaultNotary-revokeUpdateHashPermission-bytes16-address-
[VaultNotary-grantUpdateUriPermission-bytes16-address-]: #VaultNotary-grantUpdateUriPermission-bytes16-address-
[VaultNotary-revokeUpdateUriPermission-bytes16-address-]: #VaultNotary-revokeUpdateUriPermission-bytes16-address-
[VaultNotary-getVaultNotaryDetails-bytes16-]: #VaultNotary-getVaultNotaryDetails-bytes16-
[VaultNotary-setVaultUri-bytes16-string-]: #VaultNotary-setVaultUri-bytes16-string-
[VaultNotary-setVaultHash-bytes16-string-]: #VaultNotary-setVaultHash-bytes16-string-
[Ownable-constructor--]: #Ownable-constructor--
[Ownable-owner--]: #Ownable-owner--
[Ownable-isOwner--]: #Ownable-isOwner--
[Ownable-renounceOwnership--]: #Ownable-renounceOwnership--
[Ownable-transferOwnership-address-]: #Ownable-transferOwnership-address-
[Ownable-_transferOwnership-address-]: #Ownable-_transferOwnership-address-
[VaultNotary-VaultUri-address-bytes16-string-]: #VaultNotary-VaultUri-address-bytes16-string-
[VaultNotary-VaultHash-address-bytes16-string-]: #VaultNotary-VaultHash-address-bytes16-string-
[VaultNotary-VaultRegistered-address-bytes16-]: #VaultNotary-VaultRegistered-address-bytes16-
[VaultNotary-UpdateHashPermissionGranted-address-bytes16-address-]: #VaultNotary-UpdateHashPermissionGranted-address-bytes16-address-
[VaultNotary-UpdateHashPermissionRevoked-address-bytes16-address-]: #VaultNotary-UpdateHashPermissionRevoked-address-bytes16-address-
[VaultNotary-UpdateUriPermissionGranted-address-bytes16-address-]: #VaultNotary-UpdateUriPermissionGranted-address-bytes16-address-
[VaultNotary-UpdateUriPermissionRevoked-address-bytes16-address-]: #VaultNotary-UpdateUriPermissionRevoked-address-bytes16-address-
[VaultNotary-ContractDeprecatedSet-address-bool-]: #VaultNotary-ContractDeprecatedSet-address-bool-
[Ownable-OwnershipTransferred-address-address-]: #Ownable-OwnershipTransferred-address-address-
[SafeMath]: #SafeMath
[SafeMath-add-uint256-uint256-]: #SafeMath-add-uint256-uint256-
[SafeMath-sub-uint256-uint256-]: #SafeMath-sub-uint256-uint256-
[SafeMath-mul-uint256-uint256-]: #SafeMath-mul-uint256-uint256-
[SafeMath-div-uint256-uint256-]: #SafeMath-div-uint256-uint256-
[SafeMath-mod-uint256-uint256-]: #SafeMath-mod-uint256-uint256-
[Ownable]: #Ownable
[Ownable-onlyOwner--]: #Ownable-onlyOwner--
[Ownable-constructor--]: #Ownable-constructor--
[Ownable-owner--]: #Ownable-owner--
[Ownable-isOwner--]: #Ownable-isOwner--
[Ownable-renounceOwnership--]: #Ownable-renounceOwnership--
[Ownable-transferOwnership-address-]: #Ownable-transferOwnership-address-
[Ownable-_transferOwnership-address-]: #Ownable-_transferOwnership-address-
[Ownable-OwnershipTransferred-address-address-]: #Ownable-OwnershipTransferred-address-address-
[ERC20]: #ERC20
[ERC20-totalSupply--]: #ERC20-totalSupply--
[ERC20-balanceOf-address-]: #ERC20-balanceOf-address-
[ERC20-transfer-address-uint256-]: #ERC20-transfer-address-uint256-
[ERC20-allowance-address-address-]: #ERC20-allowance-address-address-
[ERC20-approve-address-uint256-]: #ERC20-approve-address-uint256-
[ERC20-transferFrom-address-address-uint256-]: #ERC20-transferFrom-address-address-uint256-
[ERC20-increaseAllowance-address-uint256-]: #ERC20-increaseAllowance-address-uint256-
[ERC20-decreaseAllowance-address-uint256-]: #ERC20-decreaseAllowance-address-uint256-
[ERC20-_transfer-address-address-uint256-]: #ERC20-_transfer-address-address-uint256-
[ERC20-_mint-address-uint256-]: #ERC20-_mint-address-uint256-
[ERC20-_burn-address-uint256-]: #ERC20-_burn-address-uint256-
[ERC20-_approve-address-address-uint256-]: #ERC20-_approve-address-address-uint256-
[ERC20-_burnFrom-address-uint256-]: #ERC20-_burnFrom-address-uint256-
[IERC20-Transfer-address-address-uint256-]: #IERC20-Transfer-address-address-uint256-
[IERC20-Approval-address-address-uint256-]: #IERC20-Approval-address-address-uint256-
[IERC20]: #IERC20
[IERC20-totalSupply--]: #IERC20-totalSupply--
[IERC20-balanceOf-address-]: #IERC20-balanceOf-address-
[IERC20-transfer-address-uint256-]: #IERC20-transfer-address-uint256-
[IERC20-allowance-address-address-]: #IERC20-allowance-address-address-
[IERC20-approve-address-uint256-]: #IERC20-approve-address-uint256-
[IERC20-transferFrom-address-address-uint256-]: #IERC20-transferFrom-address-address-uint256-
[IERC20-Transfer-address-address-uint256-]: #IERC20-Transfer-address-address-uint256-
[IERC20-Approval-address-address-uint256-]: #IERC20-Approval-address-address-uint256-
## <span id="LoadContract"></span> `LoadContract`



- [`notDeprecated()`][LoadContract-notDeprecated--]
- [`shipmentHasState(bytes16 _shipmentUuid, enum Shipment.State _state, string _message)`][LoadContract-shipmentHasState-bytes16-enum-Shipment-State-string-]
- [`escrowHasState(bytes16 _shipmentUuid, enum Escrow.State _state, string _message)`][LoadContract-escrowHasState-bytes16-enum-Escrow-State-string-]
- [`escrowHasType(bytes16 _shipmentUuid, enum Escrow.FundingType _fundingType, string _message)`][LoadContract-escrowHasType-bytes16-enum-Escrow-FundingType-string-]
- [`shipmentExists(bytes16 _shipmentUuid)`][LoadContract-shipmentExists-bytes16-]
- [`hasEscrow(bytes16 _shipmentUuid)`][LoadContract-hasEscrow-bytes16-]
- [`canFund(bytes16 _shipmentUuid, address from)`][LoadContract-canFund-bytes16-address-]
- [`canRelease(bytes16 _shipmentUuid)`][LoadContract-canRelease-bytes16-]
- [`canRefund(bytes16 _shipmentUuid)`][LoadContract-canRefund-bytes16-]
- [`canWithdraw(bytes16 _shipmentUuid)`][LoadContract-canWithdraw-bytes16-]
- [`onlyOwner()`][Ownable-onlyOwner--]
- [`setDeprecated(bool _isDeprecated)`][LoadContract-setDeprecated-bool-]
- [`setShipTokenContractAddress(address _shipTokenAddress)`][LoadContract-setShipTokenContractAddress-address-]
- [`setEscrowRefundAddress(bytes16 _shipmentUuid, address _refundAddress)`][LoadContract-setEscrowRefundAddress-bytes16-address-]
- [`createNewShipment(bytes16 _shipmentUuid, enum Escrow.FundingType _fundingType, uint256 _contractedAmount)`][LoadContract-createNewShipment-bytes16-enum-Escrow-FundingType-uint256-]
- [`createNewShipment2(bytes16 _shipmentUuid, enum Escrow.FundingType _fundingType, uint256 _contractedAmount, address _carrierAddress)`][LoadContract-createNewShipment2-bytes16-enum-Escrow-FundingType-uint256-address-]
- [`setCarrier(bytes16 _shipmentUuid, address _carrier)`][LoadContract-setCarrier-bytes16-address-]
- [`setModerator(bytes16 _shipmentUuid, address _moderator)`][LoadContract-setModerator-bytes16-address-]
- [`setInProgress(bytes16 _shipmentUuid)`][LoadContract-setInProgress-bytes16-]
- [`setComplete(bytes16 _shipmentUuid)`][LoadContract-setComplete-bytes16-]
- [`setCanceled(bytes16 _shipmentUuid)`][LoadContract-setCanceled-bytes16-]
- [`getShipmentData(bytes16 _shipmentUuid)`][LoadContract-getShipmentData-bytes16-]
- [`getEscrowData(bytes16 _shipmentUuid)`][LoadContract-getEscrowData-bytes16-]
- [`fundEscrowEther(bytes16 _shipmentUuid)`][LoadContract-fundEscrowEther-bytes16-]
- [`receiveApproval(address from, uint256 amount, address token, bytes data)`][LoadContract-receiveApproval-address-uint256-address-bytes-]
- [`releaseEscrow(bytes16 _shipmentUuid)`][LoadContract-releaseEscrow-bytes16-]
- [`withdrawEscrow(bytes16 _shipmentUuid)`][LoadContract-withdrawEscrow-bytes16-]
- [`refundEscrow(bytes16 _shipmentUuid)`][LoadContract-refundEscrow-bytes16-]
- [`constructor()`][Ownable-constructor--]
- [`owner()`][Ownable-owner--]
- [`isOwner()`][Ownable-isOwner--]
- [`renounceOwnership()`][Ownable-renounceOwnership--]
- [`transferOwnership(address newOwner)`][Ownable-transferOwnership-address-]
- [`_transferOwnership(address newOwner)`][Ownable-_transferOwnership-address-]
- [`ContractDeprecatedSet(address msgSender, bool isDeprecated)`][LoadContract-ContractDeprecatedSet-address-bool-]
- [`TokenContractAddressSet(address msgSender, address tokenContractAddress)`][LoadContract-TokenContractAddressSet-address-address-]
- [`EscrowRefundAddressSet(address msgSender, bytes16 shipmentUuid, address refundAddress)`][LoadContract-EscrowRefundAddressSet-address-bytes16-address-]
- [`ShipmentCreated(address msgSender, bytes16 shipmentUuid)`][LoadContract-ShipmentCreated-address-bytes16-]
- [`ShipmentCarrierSet(address msgSender, bytes16 shipmentUuid, address carrier)`][LoadContract-ShipmentCarrierSet-address-bytes16-address-]
- [`ShipmentModeratorSet(address msgSender, bytes16 shipmentUuid, address moderator)`][LoadContract-ShipmentModeratorSet-address-bytes16-address-]
- [`ShipmentInProgress(address msgSender, bytes16 shipmentUuid)`][LoadContract-ShipmentInProgress-address-bytes16-]
- [`ShipmentComplete(address msgSender, bytes16 shipmentUuid)`][LoadContract-ShipmentComplete-address-bytes16-]
- [`ShipmentCanceled(address msgSender, bytes16 shipmentUuid)`][LoadContract-ShipmentCanceled-address-bytes16-]
- [`EscrowDeposited(address msgSender, bytes16 shipmentUuid, uint256 amount, uint256 funded)`][LoadContract-EscrowDeposited-address-bytes16-uint256-uint256-]
- [`EscrowFunded(address msgSender, bytes16 shipmentUuid, uint256 funded, uint256 contracted)`][LoadContract-EscrowFunded-address-bytes16-uint256-uint256-]
- [`EscrowReleased(address msgSender, bytes16 shipmentUuid, uint256 funded)`][LoadContract-EscrowReleased-address-bytes16-uint256-]
- [`EscrowRefunded(address msgSender, bytes16 shipmentUuid, uint256 funded)`][LoadContract-EscrowRefunded-address-bytes16-uint256-]
- [`EscrowWithdrawn(address msgSender, bytes16 shipmentUuid, uint256 funded)`][LoadContract-EscrowWithdrawn-address-bytes16-uint256-]
- [`EscrowCreated(address msgSender, bytes16 shipmentUuid, enum Escrow.FundingType fundingType, uint256 contractedAmount, uint256 createdAt)`][LoadContract-EscrowCreated-address-bytes16-enum-Escrow-FundingType-uint256-uint256-]
- [`OwnershipTransferred(address previousOwner, address newOwner)`][Ownable-OwnershipTransferred-address-address-]
### <span id="LoadContract-notDeprecated--"></span> `notDeprecated()`

Revert if the contract has been deprecated

### <span id="LoadContract-shipmentHasState-bytes16-enum-Shipment-State-string-"></span> `shipmentHasState(bytes16 _shipmentUuid, enum Shipment.State _state, string _message)`

Revert if shipment state is not correct


### <span id="LoadContract-escrowHasState-bytes16-enum-Escrow-State-string-"></span> `escrowHasState(bytes16 _shipmentUuid, enum Escrow.State _state, string _message)`

Revert if shipment has an escrow and escrow state is not correct


### <span id="LoadContract-escrowHasType-bytes16-enum-Escrow-FundingType-string-"></span> `escrowHasType(bytes16 _shipmentUuid, enum Escrow.FundingType _fundingType, string _message)`

Revert if shipment has an escrow and escrow state is not correct


### <span id="LoadContract-shipmentExists-bytes16-"></span> `shipmentExists(bytes16 _shipmentUuid)`

Revert if shipment does not exist


### <span id="LoadContract-hasEscrow-bytes16-"></span> `hasEscrow(bytes16 _shipmentUuid)`

Revert if shipment does not have escrow


### <span id="LoadContract-canFund-bytes16-address-"></span> `canFund(bytes16 _shipmentUuid, address from)`

Revert if Shipper is not the Escrow funder


### <span id="LoadContract-canRelease-bytes16-"></span> `canRelease(bytes16 _shipmentUuid)`

Revert if msg.sender is not the shipment moderator or shipper


### <span id="LoadContract-canRefund-bytes16-"></span> `canRefund(bytes16 _shipmentUuid)`

Revert if msg.sender is not the shipment moderator or shipper


### <span id="LoadContract-canWithdraw-bytes16-"></span> `canWithdraw(bytes16 _shipmentUuid)`

Revert if msg.sender is not the shipment carrier


### <span id="LoadContract-setDeprecated-bool-"></span> `setDeprecated(bool _isDeprecated)` (external)

Only Owner

### <span id="LoadContract-setShipTokenContractAddress-address-"></span> `setShipTokenContractAddress(address _shipTokenAddress)` (external)

Only Owner

### <span id="LoadContract-setEscrowRefundAddress-bytes16-address-"></span> `setEscrowRefundAddress(bytes16 _shipmentUuid, address _refundAddress)` (external)

Only Owner

### <span id="LoadContract-createNewShipment-bytes16-enum-Escrow-FundingType-uint256-"></span> `createNewShipment(bytes16 _shipmentUuid, enum Escrow.FundingType _fundingType, uint256 _contractedAmount)` (external)

Emits ShipmentCreated on success     

### <span id="LoadContract-createNewShipment2-bytes16-enum-Escrow-FundingType-uint256-address-"></span> `createNewShipment2(bytes16 _shipmentUuid, enum Escrow.FundingType _fundingType, uint256 _contractedAmount, address _carrierAddress)` (public)

Emits ShipmentCreated on success.

### <span id="LoadContract-setCarrier-bytes16-address-"></span> `setCarrier(bytes16 _shipmentUuid, address _carrier)` (public)



### <span id="LoadContract-setModerator-bytes16-address-"></span> `setModerator(bytes16 _shipmentUuid, address _moderator)` (public)



### <span id="LoadContract-setInProgress-bytes16-"></span> `setInProgress(bytes16 _shipmentUuid)` (public)



### <span id="LoadContract-setComplete-bytes16-"></span> `setComplete(bytes16 _shipmentUuid)` (public)



### <span id="LoadContract-setCanceled-bytes16-"></span> `setCanceled(bytes16 _shipmentUuid)` (public)



### <span id="LoadContract-getShipmentData-bytes16-"></span> `getShipmentData(bytes16 _shipmentUuid) → address shipper, address carrier, address moderator, enum Shipment.State state` (public)



### <span id="LoadContract-getEscrowData-bytes16-"></span> `getEscrowData(bytes16 _shipmentUuid) → uint256 contractedAmount, uint256 fundedAmount, uint256 createdAt, enum Escrow.FundingType fundingType, enum Escrow.State state, address refundAddress` (public)



### <span id="LoadContract-fundEscrowEther-bytes16-"></span> `fundEscrowEther(bytes16 _shipmentUuid)` (public)



### <span id="LoadContract-receiveApproval-address-uint256-address-bytes-"></span> `receiveApproval(address from, uint256 amount, address token, bytes data)` (public)



### <span id="LoadContract-releaseEscrow-bytes16-"></span> `releaseEscrow(bytes16 _shipmentUuid)` (public)



### <span id="LoadContract-withdrawEscrow-bytes16-"></span> `withdrawEscrow(bytes16 _shipmentUuid)` (public)



### <span id="LoadContract-refundEscrow-bytes16-"></span> `refundEscrow(bytes16 _shipmentUuid)` (public)



### <span id="LoadContract-ContractDeprecatedSet-address-bool-"></span> `ContractDeprecatedSet(address msgSender, bool isDeprecated)`



### <span id="LoadContract-TokenContractAddressSet-address-address-"></span> `TokenContractAddressSet(address msgSender, address tokenContractAddress)`



### <span id="LoadContract-EscrowRefundAddressSet-address-bytes16-address-"></span> `EscrowRefundAddressSet(address msgSender, bytes16 shipmentUuid, address refundAddress)`



### <span id="LoadContract-ShipmentCreated-address-bytes16-"></span> `ShipmentCreated(address msgSender, bytes16 shipmentUuid)`



### <span id="LoadContract-ShipmentCarrierSet-address-bytes16-address-"></span> `ShipmentCarrierSet(address msgSender, bytes16 shipmentUuid, address carrier)`



### <span id="LoadContract-ShipmentModeratorSet-address-bytes16-address-"></span> `ShipmentModeratorSet(address msgSender, bytes16 shipmentUuid, address moderator)`



### <span id="LoadContract-ShipmentInProgress-address-bytes16-"></span> `ShipmentInProgress(address msgSender, bytes16 shipmentUuid)`



### <span id="LoadContract-ShipmentComplete-address-bytes16-"></span> `ShipmentComplete(address msgSender, bytes16 shipmentUuid)`



### <span id="LoadContract-ShipmentCanceled-address-bytes16-"></span> `ShipmentCanceled(address msgSender, bytes16 shipmentUuid)`



### <span id="LoadContract-EscrowDeposited-address-bytes16-uint256-uint256-"></span> `EscrowDeposited(address msgSender, bytes16 shipmentUuid, uint256 amount, uint256 funded)`



### <span id="LoadContract-EscrowFunded-address-bytes16-uint256-uint256-"></span> `EscrowFunded(address msgSender, bytes16 shipmentUuid, uint256 funded, uint256 contracted)`



### <span id="LoadContract-EscrowReleased-address-bytes16-uint256-"></span> `EscrowReleased(address msgSender, bytes16 shipmentUuid, uint256 funded)`



### <span id="LoadContract-EscrowRefunded-address-bytes16-uint256-"></span> `EscrowRefunded(address msgSender, bytes16 shipmentUuid, uint256 funded)`



### <span id="LoadContract-EscrowWithdrawn-address-bytes16-uint256-"></span> `EscrowWithdrawn(address msgSender, bytes16 shipmentUuid, uint256 funded)`



### <span id="LoadContract-EscrowCreated-address-bytes16-enum-Escrow-FundingType-uint256-uint256-"></span> `EscrowCreated(address msgSender, bytes16 shipmentUuid, enum Escrow.FundingType fundingType, uint256 contractedAmount, uint256 createdAt)`





## <span id="Converter"></span> `Converter`



- [`toBytes16(bytes self)`][Converter-toBytes16-bytes-]
### <span id="Converter-toBytes16-bytes-"></span> `toBytes16(bytes self) → bytes16 output` (internal)





## <span id="Escrow"></span> `Escrow`



- [`getTimeoutDate(struct Escrow.Data self)`][Escrow-getTimeoutDate-struct-Escrow-Data-]
- [`trackFunding(struct Escrow.Data self, bytes16 _shipmentUuid, uint256 amount)`][Escrow-trackFunding-struct-Escrow-Data-bytes16-uint256-]
- [`releaseFunds(struct Escrow.Data self, bytes16 _shipmentUuid)`][Escrow-releaseFunds-struct-Escrow-Data-bytes16-]
- [`withdraw(struct Escrow.Data self, bytes16 _shipmentUuid)`][Escrow-withdraw-struct-Escrow-Data-bytes16-]
- [`refund(struct Escrow.Data self, bytes16 _shipmentUuid)`][Escrow-refund-struct-Escrow-Data-bytes16-]
- [`EscrowDeposited(address msgSender, bytes16 shipmentUuid, uint256 amount, uint256 funded)`][Escrow-EscrowDeposited-address-bytes16-uint256-uint256-]
- [`EscrowFunded(address msgSender, bytes16 shipmentUuid, uint256 funded, uint256 contracted)`][Escrow-EscrowFunded-address-bytes16-uint256-uint256-]
- [`EscrowReleased(address msgSender, bytes16 shipmentUuid, uint256 funded)`][Escrow-EscrowReleased-address-bytes16-uint256-]
- [`EscrowRefunded(address msgSender, bytes16 shipmentUuid, uint256 funded)`][Escrow-EscrowRefunded-address-bytes16-uint256-]
- [`EscrowWithdrawn(address msgSender, bytes16 shipmentUuid, uint256 funded)`][Escrow-EscrowWithdrawn-address-bytes16-uint256-]
### <span id="Escrow-getTimeoutDate-struct-Escrow-Data-"></span> `getTimeoutDate(struct Escrow.Data self) → uint256 timeoutDate` (internal)



### <span id="Escrow-trackFunding-struct-Escrow-Data-bytes16-uint256-"></span> `trackFunding(struct Escrow.Data self, bytes16 _shipmentUuid, uint256 amount)` (internal)



### <span id="Escrow-releaseFunds-struct-Escrow-Data-bytes16-"></span> `releaseFunds(struct Escrow.Data self, bytes16 _shipmentUuid)` (internal)



### <span id="Escrow-withdraw-struct-Escrow-Data-bytes16-"></span> `withdraw(struct Escrow.Data self, bytes16 _shipmentUuid) → uint256 amount` (internal)



### <span id="Escrow-refund-struct-Escrow-Data-bytes16-"></span> `refund(struct Escrow.Data self, bytes16 _shipmentUuid)` (internal)



### <span id="Escrow-EscrowDeposited-address-bytes16-uint256-uint256-"></span> `EscrowDeposited(address msgSender, bytes16 shipmentUuid, uint256 amount, uint256 funded)`



### <span id="Escrow-EscrowFunded-address-bytes16-uint256-uint256-"></span> `EscrowFunded(address msgSender, bytes16 shipmentUuid, uint256 funded, uint256 contracted)`



### <span id="Escrow-EscrowReleased-address-bytes16-uint256-"></span> `EscrowReleased(address msgSender, bytes16 shipmentUuid, uint256 funded)`



### <span id="Escrow-EscrowRefunded-address-bytes16-uint256-"></span> `EscrowRefunded(address msgSender, bytes16 shipmentUuid, uint256 funded)`



### <span id="Escrow-EscrowWithdrawn-address-bytes16-uint256-"></span> `EscrowWithdrawn(address msgSender, bytes16 shipmentUuid, uint256 funded)`





## <span id="Shipment"></span> `Shipment`



- [`isShipper(struct Shipment.Data self, string message)`][Shipment-isShipper-struct-Shipment-Data-string-]
- [`setCarrier(struct Shipment.Data self, bytes16 _shipmentUuid, address _carrier)`][Shipment-setCarrier-struct-Shipment-Data-bytes16-address-]
- [`setModerator(struct Shipment.Data self, bytes16 _shipmentUuid, address _moderator)`][Shipment-setModerator-struct-Shipment-Data-bytes16-address-]
- [`setInProgress(struct Shipment.Data self, bytes16 _shipmentUuid)`][Shipment-setInProgress-struct-Shipment-Data-bytes16-]
- [`setComplete(struct Shipment.Data self, bytes16 _shipmentUuid)`][Shipment-setComplete-struct-Shipment-Data-bytes16-]
- [`setCanceled(struct Shipment.Data self, bytes16 _shipmentUuid)`][Shipment-setCanceled-struct-Shipment-Data-bytes16-]
- [`ShipmentCarrierSet(address msgSender, bytes16 shipmentUuid, address carrier)`][Shipment-ShipmentCarrierSet-address-bytes16-address-]
- [`ShipmentModeratorSet(address msgSender, bytes16 shipmentUuid, address moderator)`][Shipment-ShipmentModeratorSet-address-bytes16-address-]
- [`ShipmentInProgress(address msgSender, bytes16 shipmentUuid)`][Shipment-ShipmentInProgress-address-bytes16-]
- [`ShipmentComplete(address msgSender, bytes16 shipmentUuid)`][Shipment-ShipmentComplete-address-bytes16-]
- [`ShipmentCanceled(address msgSender, bytes16 shipmentUuid)`][Shipment-ShipmentCanceled-address-bytes16-]
### <span id="Shipment-isShipper-struct-Shipment-Data-string-"></span> `isShipper(struct Shipment.Data self, string message)`



### <span id="Shipment-setCarrier-struct-Shipment-Data-bytes16-address-"></span> `setCarrier(struct Shipment.Data self, bytes16 _shipmentUuid, address _carrier)` (internal)



### <span id="Shipment-setModerator-struct-Shipment-Data-bytes16-address-"></span> `setModerator(struct Shipment.Data self, bytes16 _shipmentUuid, address _moderator)` (internal)



### <span id="Shipment-setInProgress-struct-Shipment-Data-bytes16-"></span> `setInProgress(struct Shipment.Data self, bytes16 _shipmentUuid)` (internal)



### <span id="Shipment-setComplete-struct-Shipment-Data-bytes16-"></span> `setComplete(struct Shipment.Data self, bytes16 _shipmentUuid)` (internal)



### <span id="Shipment-setCanceled-struct-Shipment-Data-bytes16-"></span> `setCanceled(struct Shipment.Data self, bytes16 _shipmentUuid)` (internal)



### <span id="Shipment-ShipmentCarrierSet-address-bytes16-address-"></span> `ShipmentCarrierSet(address msgSender, bytes16 shipmentUuid, address carrier)`



### <span id="Shipment-ShipmentModeratorSet-address-bytes16-address-"></span> `ShipmentModeratorSet(address msgSender, bytes16 shipmentUuid, address moderator)`



### <span id="Shipment-ShipmentInProgress-address-bytes16-"></span> `ShipmentInProgress(address msgSender, bytes16 shipmentUuid)`



### <span id="Shipment-ShipmentComplete-address-bytes16-"></span> `ShipmentComplete(address msgSender, bytes16 shipmentUuid)`



### <span id="Shipment-ShipmentCanceled-address-bytes16-"></span> `ShipmentCanceled(address msgSender, bytes16 shipmentUuid)`





## <span id="Migrations"></span> `Migrations`



- [`restricted()`][Migrations-restricted--]
- [`constructor()`][Migrations-constructor--]
- [`setCompleted(uint256 completed)`][Migrations-setCompleted-uint256-]
- [`upgrade(address new_address)`][Migrations-upgrade-address-]
### <span id="Migrations-restricted--"></span> `restricted()`



### <span id="Migrations-constructor--"></span> `constructor()` (public)



### <span id="Migrations-setCompleted-uint256-"></span> `setCompleted(uint256 completed)` (public)



### <span id="Migrations-upgrade-address-"></span> `upgrade(address new_address)` (public)





## <span id="VaultNotary"></span> `VaultNotary`



- [`canUpdateUri(bytes16 vaultId)`][VaultNotary-canUpdateUri-bytes16-]
- [`canUpdateHash(bytes16 vaultId)`][VaultNotary-canUpdateHash-bytes16-]
- [`vaultOwnerOnly(bytes16 vaultId)`][VaultNotary-vaultOwnerOnly-bytes16-]
- [`isNotRegistered(bytes16 vaultId)`][VaultNotary-isNotRegistered-bytes16-]
- [`isRegistered(bytes16 vaultId)`][VaultNotary-isRegistered-bytes16-]
- [`notDeprecated()`][VaultNotary-notDeprecated--]
- [`onlyOwner()`][Ownable-onlyOwner--]
- [`registerVault(bytes16 vaultId, string vaultUri, string vaultHash)`][VaultNotary-registerVault-bytes16-string-string-]
- [`setDeprecated(bool _isDeprecated)`][VaultNotary-setDeprecated-bool-]
- [`grantUpdateHashPermission(bytes16 vaultId, address addressToGrant)`][VaultNotary-grantUpdateHashPermission-bytes16-address-]
- [`revokeUpdateHashPermission(bytes16 vaultId, address addressToRevoke)`][VaultNotary-revokeUpdateHashPermission-bytes16-address-]
- [`grantUpdateUriPermission(bytes16 vaultId, address addressToGrant)`][VaultNotary-grantUpdateUriPermission-bytes16-address-]
- [`revokeUpdateUriPermission(bytes16 vaultId, address addressToRevoke)`][VaultNotary-revokeUpdateUriPermission-bytes16-address-]
- [`getVaultNotaryDetails(bytes16 vaultId)`][VaultNotary-getVaultNotaryDetails-bytes16-]
- [`setVaultUri(bytes16 vaultId, string vaultUri)`][VaultNotary-setVaultUri-bytes16-string-]
- [`setVaultHash(bytes16 vaultId, string vaultHash)`][VaultNotary-setVaultHash-bytes16-string-]
- [`constructor()`][Ownable-constructor--]
- [`owner()`][Ownable-owner--]
- [`isOwner()`][Ownable-isOwner--]
- [`renounceOwnership()`][Ownable-renounceOwnership--]
- [`transferOwnership(address newOwner)`][Ownable-transferOwnership-address-]
- [`_transferOwnership(address newOwner)`][Ownable-_transferOwnership-address-]
- [`VaultUri(address msgSender, bytes16 vaultId, string vaultUri)`][VaultNotary-VaultUri-address-bytes16-string-]
- [`VaultHash(address msgSender, bytes16 vaultId, string vaultHash)`][VaultNotary-VaultHash-address-bytes16-string-]
- [`VaultRegistered(address msgSender, bytes16 vaultId)`][VaultNotary-VaultRegistered-address-bytes16-]
- [`UpdateHashPermissionGranted(address msgSender, bytes16 vaultId, address addressToGrant)`][VaultNotary-UpdateHashPermissionGranted-address-bytes16-address-]
- [`UpdateHashPermissionRevoked(address msgSender, bytes16 vaultId, address addressToRevoke)`][VaultNotary-UpdateHashPermissionRevoked-address-bytes16-address-]
- [`UpdateUriPermissionGranted(address msgSender, bytes16 vaultId, address addressToGrant)`][VaultNotary-UpdateUriPermissionGranted-address-bytes16-address-]
- [`UpdateUriPermissionRevoked(address msgSender, bytes16 vaultId, address addressToRevoke)`][VaultNotary-UpdateUriPermissionRevoked-address-bytes16-address-]
- [`ContractDeprecatedSet(address msgSender, bool isDeprecated)`][VaultNotary-ContractDeprecatedSet-address-bool-]
- [`OwnershipTransferred(address previousOwner, address newOwner)`][Ownable-OwnershipTransferred-address-address-]
### <span id="VaultNotary-canUpdateUri-bytes16-"></span> `canUpdateUri(bytes16 vaultId)`

Modifier for limiting the access to vaultUri update
only whitelisted user can do the decorated operation

### <span id="VaultNotary-canUpdateHash-bytes16-"></span> `canUpdateHash(bytes16 vaultId)`

Modifier for limiting the access to vaultHash update
only whitelisted user can do the decorated operation

### <span id="VaultNotary-vaultOwnerOnly-bytes16-"></span> `vaultOwnerOnly(bytes16 vaultId)`

Modifier for limiting the access to grant and revoke permissions
Will check the message sender, only the owner of a vault can do the operation decorated


### <span id="VaultNotary-isNotRegistered-bytes16-"></span> `isNotRegistered(bytes16 vaultId)`



### <span id="VaultNotary-isRegistered-bytes16-"></span> `isRegistered(bytes16 vaultId)`



### <span id="VaultNotary-notDeprecated--"></span> `notDeprecated()`



### <span id="VaultNotary-registerVault-bytes16-string-string-"></span> `registerVault(bytes16 vaultId, string vaultUri, string vaultHash)` (external)

It sets the msg.sender to the vault owner and set the update permission of the owner to true
It calls the setVaultUir and setVaultHash to initialize those two records


### <span id="VaultNotary-setDeprecated-bool-"></span> `setDeprecated(bool _isDeprecated)` (external)



### <span id="VaultNotary-grantUpdateHashPermission-bytes16-address-"></span> `grantUpdateHashPermission(bytes16 vaultId, address addressToGrant)` (external)



### <span id="VaultNotary-revokeUpdateHashPermission-bytes16-address-"></span> `revokeUpdateHashPermission(bytes16 vaultId, address addressToRevoke)` (external)



### <span id="VaultNotary-grantUpdateUriPermission-bytes16-address-"></span> `grantUpdateUriPermission(bytes16 vaultId, address addressToGrant)` (external)



### <span id="VaultNotary-revokeUpdateUriPermission-bytes16-address-"></span> `revokeUpdateUriPermission(bytes16 vaultId, address addressToRevoke)` (external)



### <span id="VaultNotary-getVaultNotaryDetails-bytes16-"></span> `getVaultNotaryDetails(bytes16 vaultId) → string vaultUri, string vaultHash` (external)



### <span id="VaultNotary-setVaultUri-bytes16-string-"></span> `setVaultUri(bytes16 vaultId, string vaultUri)` (public)



### <span id="VaultNotary-setVaultHash-bytes16-string-"></span> `setVaultHash(bytes16 vaultId, string vaultHash)` (public)



### <span id="VaultNotary-VaultUri-address-bytes16-string-"></span> `VaultUri(address msgSender, bytes16 vaultId, string vaultUri)`



### <span id="VaultNotary-VaultHash-address-bytes16-string-"></span> `VaultHash(address msgSender, bytes16 vaultId, string vaultHash)`



### <span id="VaultNotary-VaultRegistered-address-bytes16-"></span> `VaultRegistered(address msgSender, bytes16 vaultId)`



### <span id="VaultNotary-UpdateHashPermissionGranted-address-bytes16-address-"></span> `UpdateHashPermissionGranted(address msgSender, bytes16 vaultId, address addressToGrant)`



### <span id="VaultNotary-UpdateHashPermissionRevoked-address-bytes16-address-"></span> `UpdateHashPermissionRevoked(address msgSender, bytes16 vaultId, address addressToRevoke)`



### <span id="VaultNotary-UpdateUriPermissionGranted-address-bytes16-address-"></span> `UpdateUriPermissionGranted(address msgSender, bytes16 vaultId, address addressToGrant)`



### <span id="VaultNotary-UpdateUriPermissionRevoked-address-bytes16-address-"></span> `UpdateUriPermissionRevoked(address msgSender, bytes16 vaultId, address addressToRevoke)`



### <span id="VaultNotary-ContractDeprecatedSet-address-bool-"></span> `ContractDeprecatedSet(address msgSender, bool isDeprecated)`





## <span id="SafeMath"></span> `SafeMath`

Wrappers over Solidity's arithmetic operations with added overflow
checks.

Arithmetic operations in Solidity wrap on overflow. This can easily result
in bugs, because programmers usually assume that an overflow raises an
error, which is the standard behavior in high level programming languages.
`SafeMath` restores this intuition by reverting the transaction when an
operation overflows.

Using this library instead of the unchecked operations eliminates an entire
class of bugs, so it's recommended to use it always.

- [`add(uint256 a, uint256 b)`][SafeMath-add-uint256-uint256-]
- [`sub(uint256 a, uint256 b)`][SafeMath-sub-uint256-uint256-]
- [`mul(uint256 a, uint256 b)`][SafeMath-mul-uint256-uint256-]
- [`div(uint256 a, uint256 b)`][SafeMath-div-uint256-uint256-]
- [`mod(uint256 a, uint256 b)`][SafeMath-mod-uint256-uint256-]
### <span id="SafeMath-add-uint256-uint256-"></span> `add(uint256 a, uint256 b) → uint256` (internal)

Returns the addition of two unsigned integers, reverting on
overflow.

Counterpart to Solidity's `+` operator.

Requirements:
- Addition cannot overflow.

### <span id="SafeMath-sub-uint256-uint256-"></span> `sub(uint256 a, uint256 b) → uint256` (internal)

Returns the subtraction of two unsigned integers, reverting on
overflow (when the result is negative).

Counterpart to Solidity's `-` operator.

Requirements:
- Subtraction cannot overflow.

### <span id="SafeMath-mul-uint256-uint256-"></span> `mul(uint256 a, uint256 b) → uint256` (internal)

Returns the multiplication of two unsigned integers, reverting on
overflow.

Counterpart to Solidity's `*` operator.

Requirements:
- Multiplication cannot overflow.

### <span id="SafeMath-div-uint256-uint256-"></span> `div(uint256 a, uint256 b) → uint256` (internal)

Returns the integer division of two unsigned integers. Reverts on
division by zero. The result is rounded towards zero.

Counterpart to Solidity's `/` operator. Note: this function uses a
`revert` opcode (which leaves remaining gas untouched) while Solidity
uses an invalid opcode to revert (consuming all remaining gas).

Requirements:
- The divisor cannot be zero.

### <span id="SafeMath-mod-uint256-uint256-"></span> `mod(uint256 a, uint256 b) → uint256` (internal)

Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
Reverts when dividing by zero.

Counterpart to Solidity's `%` operator. This function uses a `revert`
opcode (which leaves remaining gas untouched) while Solidity uses an
invalid opcode to revert (consuming all remaining gas).

Requirements:
- The divisor cannot be zero.



## <span id="Ownable"></span> `Ownable`

Contract module which provides a basic access control mechanism, where
there is an account (an owner) that can be granted exclusive access to
specific functions.

This module is used through inheritance. It will make available the modifier
`onlyOwner`, which can be aplied to your functions to restrict their use to
the owner.

- [`onlyOwner()`][Ownable-onlyOwner--]
- [`constructor()`][Ownable-constructor--]
- [`owner()`][Ownable-owner--]
- [`isOwner()`][Ownable-isOwner--]
- [`renounceOwnership()`][Ownable-renounceOwnership--]
- [`transferOwnership(address newOwner)`][Ownable-transferOwnership-address-]
- [`_transferOwnership(address newOwner)`][Ownable-_transferOwnership-address-]
- [`OwnershipTransferred(address previousOwner, address newOwner)`][Ownable-OwnershipTransferred-address-address-]
### <span id="Ownable-onlyOwner--"></span> `onlyOwner()`

Throws if called by any account other than the owner.

### <span id="Ownable-constructor--"></span> `constructor()` (internal)

Initializes the contract setting the deployer as the initial owner.

### <span id="Ownable-owner--"></span> `owner() → address` (public)

Returns the address of the current owner.

### <span id="Ownable-isOwner--"></span> `isOwner() → bool` (public)

Returns true if the caller is the current owner.

### <span id="Ownable-renounceOwnership--"></span> `renounceOwnership()` (public)

Leaves the contract without owner. It will not be possible to call
`onlyOwner` functions anymore. Can only be called by the current owner.

> Note: Renouncing ownership will leave the contract without an owner,
thereby removing any functionality that is only available to the owner.

### <span id="Ownable-transferOwnership-address-"></span> `transferOwnership(address newOwner)` (public)

Transfers ownership of the contract to a new account (`newOwner`).
Can only be called by the current owner.

### <span id="Ownable-_transferOwnership-address-"></span> `_transferOwnership(address newOwner)` (internal)

Transfers ownership of the contract to a new account (`newOwner`).

### <span id="Ownable-OwnershipTransferred-address-address-"></span> `OwnershipTransferred(address previousOwner, address newOwner)`





## <span id="ERC20"></span> `ERC20`

Implementation of the `IERC20` interface.

This implementation is agnostic to the way tokens are created. This means
that a supply mechanism has to be added in a derived contract using `_mint`.
For a generic mechanism see `ERC20Mintable`.

*For a detailed writeup see our guide [How to implement supply
mechanisms](https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226).*

We have followed general OpenZeppelin guidelines: functions revert instead
of returning `false` on failure. This behavior is nonetheless conventional
and does not conflict with the expectations of ERC20 applications.

Additionally, an `Approval` event is emitted on calls to `transferFrom`.
This allows applications to reconstruct the allowance for all accounts just
by listening to said events. Other implementations of the EIP may not emit
these events, as it isn't required by the specification.

Finally, the non-standard `decreaseAllowance` and `increaseAllowance`
functions have been added to mitigate the well-known issues around setting
allowances. See `IERC20.approve`.

- [`totalSupply()`][ERC20-totalSupply--]
- [`balanceOf(address account)`][ERC20-balanceOf-address-]
- [`transfer(address recipient, uint256 amount)`][ERC20-transfer-address-uint256-]
- [`allowance(address owner, address spender)`][ERC20-allowance-address-address-]
- [`approve(address spender, uint256 value)`][ERC20-approve-address-uint256-]
- [`transferFrom(address sender, address recipient, uint256 amount)`][ERC20-transferFrom-address-address-uint256-]
- [`increaseAllowance(address spender, uint256 addedValue)`][ERC20-increaseAllowance-address-uint256-]
- [`decreaseAllowance(address spender, uint256 subtractedValue)`][ERC20-decreaseAllowance-address-uint256-]
- [`_transfer(address sender, address recipient, uint256 amount)`][ERC20-_transfer-address-address-uint256-]
- [`_mint(address account, uint256 amount)`][ERC20-_mint-address-uint256-]
- [`_burn(address account, uint256 value)`][ERC20-_burn-address-uint256-]
- [`_approve(address owner, address spender, uint256 value)`][ERC20-_approve-address-address-uint256-]
- [`_burnFrom(address account, uint256 amount)`][ERC20-_burnFrom-address-uint256-]
- [`Transfer(address from, address to, uint256 value)`][IERC20-Transfer-address-address-uint256-]
- [`Approval(address owner, address spender, uint256 value)`][IERC20-Approval-address-address-uint256-]
### <span id="ERC20-totalSupply--"></span> `totalSupply() → uint256` (public)

See `IERC20.totalSupply`.

### <span id="ERC20-balanceOf-address-"></span> `balanceOf(address account) → uint256` (public)

See `IERC20.balanceOf`.

### <span id="ERC20-transfer-address-uint256-"></span> `transfer(address recipient, uint256 amount) → bool` (public)

See `IERC20.transfer`.

Requirements:

- `recipient` cannot be the zero address.
- the caller must have a balance of at least `amount`.

### <span id="ERC20-allowance-address-address-"></span> `allowance(address owner, address spender) → uint256` (public)

See `IERC20.allowance`.

### <span id="ERC20-approve-address-uint256-"></span> `approve(address spender, uint256 value) → bool` (public)

See `IERC20.approve`.

Requirements:

- `spender` cannot be the zero address.

### <span id="ERC20-transferFrom-address-address-uint256-"></span> `transferFrom(address sender, address recipient, uint256 amount) → bool` (public)

See `IERC20.transferFrom`.

Emits an `Approval` event indicating the updated allowance. This is not
required by the EIP. See the note at the beginning of `ERC20`;

Requirements:
- `sender` and `recipient` cannot be the zero address.
- `sender` must have a balance of at least `value`.
- the caller must have allowance for `sender`'s tokens of at least
`amount`.

### <span id="ERC20-increaseAllowance-address-uint256-"></span> `increaseAllowance(address spender, uint256 addedValue) → bool` (public)

Atomically increases the allowance granted to `spender` by the caller.

This is an alternative to `approve` that can be used as a mitigation for
problems described in `IERC20.approve`.

Emits an `Approval` event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address.

### <span id="ERC20-decreaseAllowance-address-uint256-"></span> `decreaseAllowance(address spender, uint256 subtractedValue) → bool` (public)

Atomically decreases the allowance granted to `spender` by the caller.

This is an alternative to `approve` that can be used as a mitigation for
problems described in `IERC20.approve`.

Emits an `Approval` event indicating the updated allowance.

Requirements:

- `spender` cannot be the zero address.
- `spender` must have allowance for the caller of at least
`subtractedValue`.

### <span id="ERC20-_transfer-address-address-uint256-"></span> `_transfer(address sender, address recipient, uint256 amount)` (internal)

Moves tokens `amount` from `sender` to `recipient`.

This is internal function is equivalent to `transfer`, and can be used to
e.g. implement automatic token fees, slashing mechanisms, etc.

Emits a `Transfer` event.

Requirements:

- `sender` cannot be the zero address.
- `recipient` cannot be the zero address.
- `sender` must have a balance of at least `amount`.

### <span id="ERC20-_mint-address-uint256-"></span> `_mint(address account, uint256 amount)` (internal)

Creates `amount` tokens and assigns them to `account`, increasing
the total supply.

Emits a `Transfer` event with `from` set to the zero address.

Requirements

- `to` cannot be the zero address.

### <span id="ERC20-_burn-address-uint256-"></span> `_burn(address account, uint256 value)` (internal)

Destoys `amount` tokens from `account`, reducing the
total supply.

Emits a `Transfer` event with `to` set to the zero address.

Requirements

- `account` cannot be the zero address.
- `account` must have at least `amount` tokens.

### <span id="ERC20-_approve-address-address-uint256-"></span> `_approve(address owner, address spender, uint256 value)` (internal)

Sets `amount` as the allowance of `spender` over the `owner`s tokens.

This is internal function is equivalent to `approve`, and can be used to
e.g. set automatic allowances for certain subsystems, etc.

Emits an `Approval` event.

Requirements:

- `owner` cannot be the zero address.
- `spender` cannot be the zero address.

### <span id="ERC20-_burnFrom-address-uint256-"></span> `_burnFrom(address account, uint256 amount)` (internal)

Destoys `amount` tokens from `account`.`amount` is then deducted
from the caller's allowance.

See `_burn` and `_approve`.



## <span id="IERC20"></span> `IERC20`

Interface of the ERC20 standard as defined in the EIP. Does not include
the optional functions; to access them see `ERC20Detailed`.

- [`totalSupply()`][IERC20-totalSupply--]
- [`balanceOf(address account)`][IERC20-balanceOf-address-]
- [`transfer(address recipient, uint256 amount)`][IERC20-transfer-address-uint256-]
- [`allowance(address owner, address spender)`][IERC20-allowance-address-address-]
- [`approve(address spender, uint256 amount)`][IERC20-approve-address-uint256-]
- [`transferFrom(address sender, address recipient, uint256 amount)`][IERC20-transferFrom-address-address-uint256-]
- [`Transfer(address from, address to, uint256 value)`][IERC20-Transfer-address-address-uint256-]
- [`Approval(address owner, address spender, uint256 value)`][IERC20-Approval-address-address-uint256-]
### <span id="IERC20-totalSupply--"></span> `totalSupply() → uint256` (external)

Returns the amount of tokens in existence.

### <span id="IERC20-balanceOf-address-"></span> `balanceOf(address account) → uint256` (external)

Returns the amount of tokens owned by `account`.

### <span id="IERC20-transfer-address-uint256-"></span> `transfer(address recipient, uint256 amount) → bool` (external)

Moves `amount` tokens from the caller's account to `recipient`.

Returns a boolean value indicating whether the operation succeeded.

Emits a `Transfer` event.

### <span id="IERC20-allowance-address-address-"></span> `allowance(address owner, address spender) → uint256` (external)

Returns the remaining number of tokens that `spender` will be
allowed ed:   package.json

kkkkkkkkkkkkkk
to spend on behalf of `owner` through `transferFrom`. This is
zero by default.

This value changes when `approve` or `transferFrom` are called.

### <span id="IERC20-approve-address-uint256-"></span> `approve(address spender, uint256 amount) → bool` (external)

Sets `amount` as the allowance of `spender` over the caller's tokens.

Returns a boolean value indicating whether the operation succeeded.

> Beware that changing an allowance with this method brings the risk
that someone may use both the old and the new allowance by unfortunate
transaction ordering. One possible solution to mitigate this race
condition is to first reduce the spender's allowance to 0 and set the
desired value afterwards:
https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729

Emits an `Approval` event.

### <span id="IERC20-transferFrom-address-address-uint256-"></span> `transferFrom(address sender, address recipient, uint256 amount) → bool` (external)

Moves `amount` tokens from `sender` to `recipient` using the
allowance mechanism. `amount` is then deducted from the caller's
allowance.

Returns a boolean value indicating whether the operation succeeded.

Emits a `Transfer` event.

### <span id="IERC20-Transfer-address-address-uint256-"></span> `Transfer(address from, address to, uint256 value)`

Emitted when `value` tokens are moved from one account (`from`) to
another (`to`).

Note that `value` may be zero.

### <span id="IERC20-Approval-address-address-uint256-"></span> `Approval(address owner, address spender, uint256 value)`

Emitted when the allowance of a `spender` for an `owner` is set by
a call to `approve`. `value` is the new allowance.

