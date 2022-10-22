import Identity from 0xf8d6e0586b0a20c7

pub fun main(acct: Address): [String] {
  let publicRef = getAccount(acct).getCapability(Identity.DelegationPublicPath)
            .borrow<&Identity.Delegations{Identity.DelegationsPublic}>()
            ?? panic ("Oof ouch owie this account doesn't have a delegations there")

  return publicRef.getDelegatedChains()
}