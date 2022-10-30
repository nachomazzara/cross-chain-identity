// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

contract Identity {
	enum CHAINS {
		INVALID,
		EVM,
		FLOW,
		BSC,
		TRON
	}

	mapping(address => mapping(CHAINS => string)) public delegations;
	mapping(string => address[]) public delegationsLookup;
	mapping(string => mapping(address => uint256)) public lookupIndexes;

	event DelegationSet(address _owner, CHAINS _chainId, string _account);

	error InvalidChainId(CHAINS _chainId);

	function setDelegation(CHAINS _chainId, string calldata _account) external {
		if (_chainId == CHAINS.INVALID) {
			revert InvalidChainId(_chainId);
		}

		string memory oldAccount = delegations[msg.sender][_chainId];
		delegations[msg.sender][_chainId] = _account;

		uint256 index = lookupIndexes[oldAccount][msg.sender];
		delete lookupIndexes[oldAccount][msg.sender];

		if (bytes(oldAccount).length > 0 && index > 0) {
			delegationsLookup[oldAccount][index - 1] = address(0);
		}

		delegationsLookup[_account].push(msg.sender);
		lookupIndexes[_account][msg.sender] = delegationsLookup[_account].length;

		emit DelegationSet(msg.sender, _chainId, _account);
	}

	function getDelegation(address _owner, CHAINS _chainId) external view returns (string memory) {
		return delegations[_owner][_chainId];
	}

	function getLookup(string calldata _account, uint256 _index) external view returns (address) {
		return delegationsLookup[_account][_index];
	}

	function getLookupLength(string calldata _account) external view returns (uint256) {
		return delegationsLookup[_account].length;
	}
}
