export const getDelegations = `
import Identity from 0x8987ce9a9bc21df4

pub fun main(acct: Address): [Identity.CHAINS] {
  let publicRef = getAccount(acct)
    .getCapability(Identity.DelegationPublicPath)
    .borrow<&{Identity.DelegationsPublic}>()
    ?? panic("Could not get receiver reference to the Delegations")

  return publicRef.getDelegatedChains()
}
`

export const getDelegation = `
import Identity from 0x8987ce9a9bc21df4

pub fun main(acct: Address, chainId: UInt8): &Identity.Delegation? {
  let publicRef = getAccount(acct)
    .getCapability(Identity.DelegationPublicPath)
    .borrow<&{Identity.DelegationsPublic}>()
    ?? panic("Could not get receiver reference to the Delegations")

  return publicRef.getDelegation(chainId: Identity.CHAINS(rawInput: chainId) ?? panic("Invalid chain") )
}
`

export const geLookupByAddress = `
import Identity from 0x8987ce9a9bc21df4

pub fun main(address: String): {Address: Bool}? {
  return Identity.getLookupsByDelegatedAddress(address: address)
}
`
