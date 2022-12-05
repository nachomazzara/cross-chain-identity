# Identity (Crosschain ⛓)

POC on how a multichain delegation work focused on the soft usage of NFTS

The main motivation is to leverage each blockchain storage by allowing users to log in with an account at any dApp and see all the NFTs owned in different blockchains. It uses soft delegation, meaning you just need to be connected to only one blockchain. E.g., If my FLOW address: _0xNachoFlow_ has 10 NFTs, I can set a delegation to my Ethereum address: _0xNachoEVM_. Therefore, I can join Metaverses like Decentraland, Marketplaces like OpenSea, etc., using _0xNachoEVM_ and see EVM NFTs and the 10 NFTs owned in the FLOW blockchain by _0xNachoFlow_.

To make it work, dApps may know in advance each contract address (fixed address, one per blockchain) and consume delegation lookups. A delegation lookup is called when you find which addresses from other blockchains have been added to the blockchain where you must fetch the NFTs.

...WIP 💤...

Try it: https://identity-nachomazzara.vercel.app/

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