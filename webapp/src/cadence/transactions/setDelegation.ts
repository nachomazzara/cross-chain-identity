export const setDelegation = `
import Identity from 0x8987ce9a9bc21df4

// Our transaction object now takes in arguments!
transaction(
    chainId: UInt8,
    address: String,
) {
 // The private reference to user's BloctoToken vault
  let delegationsRef: &Identity.Delegations?
  prepare(signer: AuthAccount) {
    // Check if the user sending the transaction has a delegations
    self.delegationsRef = signer.borrow<&Identity.Delegations>(from: Identity.DelegationStoragePath)
    if (self.delegationsRef != nil) {
        log("already has an account")
        return
    }

    // If they don't, we create a new empty delegations
    let delegation <- Identity.createDelegations()

    // Save it to the account
    signer.save(<-delegation, to: Identity.DelegationStoragePath)

    // Create a public capability for the Delegations
    signer.link<&{Identity.DelegationsPublic}>(
        Identity.DelegationPublicPath,
        target: Identity.DelegationStoragePath
    )

    self.delegationsRef = signer.borrow<&Identity.Delegations>(from: Identity.DelegationStoragePath)
  }


  execute {
    self.delegationsRef!.set(chainId: chainId, address: address)

    log("Delegation set!")
  }
}
`
