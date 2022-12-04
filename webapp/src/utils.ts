import * as ethers from 'ethers'
import { Web3Provider } from '@ethersproject/providers'

export enum CHAINS_MAP {
  INVALID,
  EVM,
  FLOW,
  BSC,
  TRON,
}

export const CHAINS: { [key: number]: string } = {
  1: 'EVM: Ethereum, Polygon, Optimism, etc...',
  2: 'Flow',
  3: 'BSC',
  4: 'TRON',
}

export type User = {
  [key in CHAINS_MAP]?: string
}

export type UserLookups = {
  [key in CHAINS_MAP]?: string[]
}

export type NFTS = {
  [key in CHAINS_MAP]?: { [key: string]: NFT }
}

export type NFT = {
  id: string
  name: string
  thumbnail: string
  link: string
}

export type Delegations = {
  [key: number]: string
}

export function getEVMContract(library?: Web3Provider) {
  const abi =
    '[{"inputs":[{"internalType":"enum Identity.CHAINS","name":"_chainId","type":"uint8"}],"name":"InvalidChainId","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_owner","type":"address"},{"indexed":false,"internalType":"enum Identity.CHAINS","name":"_chainId","type":"uint8"},{"indexed":false,"internalType":"string","name":"_account","type":"string"}],"name":"DelegationSet","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"enum Identity.CHAINS","name":"","type":"uint8"}],"name":"delegations","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"delegationsLookup","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"enum Identity.CHAINS","name":"_chainId","type":"uint8"}],"name":"getDelegation","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_account","type":"string"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getLookup","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_account","type":"string"}],"name":"getLookupLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"address","name":"","type":"address"}],"name":"lookupIndexes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"enum Identity.CHAINS","name":"_chainId","type":"uint8"},{"internalType":"string","name":"_account","type":"string"}],"name":"setDelegation","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
  return new ethers.Contract(
    '0xb8453d6f9eb2ddd27cbc0619900c710143ad7384',
    abi,
    library?.getSigner() ||
    new ethers.providers.InfuraProvider(
      'goerli',
      'f7defca20b2a455b99ac25b99222dab2'
    )
  )
}
