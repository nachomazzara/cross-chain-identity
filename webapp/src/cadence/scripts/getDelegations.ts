export const getDelegations = `
import Identity from 0x3594e540d91a8f4b

pub fun main(acct: Address): [String] {
  let publicRef = getAccount(acct)
    .getCapability(Identity.DelegationPublicPath)
    .borrow<&{Identity.DelegationsPublic}>()
    ?? panic("Could not get receiver reference to the NFT Collection")

  return publicRef.getDelegatedChains()
}
`

export const getDelegation = `
import Identity from 0x3594e540d91a8f4b

pub fun main(acct: Address, chainName: String): &Identity.Delegation {
  let publicRef = getAccount(acct)
    .getCapability(Identity.DelegationPublicPath)
    .borrow<&{Identity.DelegationsPublic}>()
    ?? panic("Could not get receiver reference to the NFT Collection")

  return publicRef.getDelegation(chainName: chainName)
}
`