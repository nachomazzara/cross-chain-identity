# Identity (Crosschain ⛓)

POC on how a multichain delegation work focused on the soft usage of NFTS

The primary motivation is to leverage each blockchain storage by allowing users to log in with an account at any dApp and see all the NFTs owned in different blockchains. It uses soft delegation, meaning you need to be connected to only one blockchain. E.g., If my FLOW address: _0xNachoFlow_ has 10 NFTs, I can set a delegation to my Ethereum address: _0xNachoEVM_. Therefore, I can join Metaverses like Decentraland, Marketplaces like OpenSea, etc., using _0xNachoEVM_ and see EVM NFTs and the 10 NFTs owned in the FLOW blockchain by _0xNachoFlow_.

To make it work, dApps may know in advance each contract address (fixed address, one per blockchain) and consume delegation lookups. A delegation lookup is called when you find which addresses from other blockchains have been added to the blockchain where you must fetch the NFTs.

After the delegation is set, you only need to be connected to one chain to see all the NFTS delegated to you.

Try it: https://identity-nachomazzara.vercel.app/

## Use Cases

### Before you read
- blockchain_0, blockchain_1, blockchain_2, and blockchain_n are blockchain with different account protocol.
- user1.b_0, user1.b_1, user1.b_2, and user1.b_n are valid blockchain 0, 1, 2, and n accounts.
- Identity_EVM_SC, Identity_Flow_SC, Identity_Blockchain_1_SC, Identity_Blockchain_2_SC, and Identity_Blockchain_n_SC are the Identity smart contract deployed on each blockchain.
- user1.eth is a valid Ethereum account.
- user1.flow is a valid Flow account.

### Delegate to other accounts

Delegate the usage of your _Blockchain_0_ NFTs to other Blockchain accounts

![General delegate](/images/general_delegate.png "General delegate")

### Fetch delegated NFTs

Fetch delegated NFTs.

![Fetch delegate NFTs](/images/general_fetch_nfts.png "Fetch delegate NFTs")

#### Using specific examples with real blockchains

- Delegate the usage of your EVM NFTs to _user1.flow_

![Delegate the usage of your EVM NFTs to user1.flow](/images/evm_delegate.png "Delegate the usage of your EVM NFTs to user1.flow")

- Fetch NFTs from _user1.flow_ and EVM accounts by only being connected to Flow.

![Fetch NFTs from user1.flow and EVM accounts by only being connected to Flow](/images/flow_fetch_nfts.png "Fetch NFTs from user1.flow and EVM accounts by only being connected to Flow")

- Delegate the usage of your Flow NFTs to _user1.eth_

![Delegate the usage of your Flow NFTs to user1.eth](/images/flow_delegate.png "Delegate the usage of your Flow NFTs to user1.eth")

- Fetch NFTs from _user1.eth_ and Flow accounts by only being connected to EVM.

![Fetch NFTs from user1.eth and Flow accounts by only being connected to EVM](/images/evm_fetch_nfts.png "Fetch NFTs from user1.eth and Flow accounts by only being connected to EVM")


## Considerations

- Only working for EVM chains and Flow. For EVM chains, only Ethereum Goerli can be used to set up delegations.
- Contracts are not battle tested and may have vulnerabilities. DO NOT USE IT for production.
- TRON, SOLANA, CARDANO, etc., can be easily added. This is just a proof of concept.

# Instal & Run

Simple create react-app + lambda with vercel:

```bash
# Instal
npm ci
npm i -g vercel

# Run
vercel dev
```