export const addDelegation = `
import Identity from 0x3594e540d91a8f4b

// Our transaction object now takes in arguments!
transaction(
    recipient: Address,
    chainName: String,
    address: String,
) {
  prepare(signer: AuthAccount) {
    // Check if the user sending the transaction has a collection
    if signer.borrow<&Identity.Delegations>(from: Identity.DelegationStoragePath) != nil {
        log("already has an account")
        return
    }

    // If they don't, we create a new empty collection
    let delegation <- Identity.createDelegations()

    // Save it to the account
    signer.save(<-delegation, to: Identity.DelegationStoragePath)

    // Create a public capability for the collection
    signer.link<&{Identity.DelegationsPublic}>(
        Identity.DelegationPublicPath,
        target: Identity.DelegationStoragePath
    )
  }


  execute {
    // Borrow the recipient's public NFT collection reference
    let receiver = getAccount(recipient)
        .getCapability(Identity.DelegationPublicPath)
        .borrow<&{Identity.DelegationsPublic}>()
        ?? panic("Could not get receiver reference to the NFT Collection")

    // Mint the NFT and deposit it to the recipient's collection
    Identity.addDelegation(
        recipient: receiver,
        chainName: chainName,
        address: address
    )

    log("Minted an NFT and stored it into the collection")
  }
}
`
