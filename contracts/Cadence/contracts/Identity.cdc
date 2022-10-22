pub contract Identity {
  pub event DelegationAdded(chainName: String, operator: String, caller: Address?)
  pub event DelegationRemoved(chainName: String, operator: String, caller: Address?)

  pub let DelegationStoragePath: StoragePath
  pub let DelegationPublicPath: PublicPath

  pub resource Delegation {
    pub let chainName: String
    pub let address: String

    // We set the ID of the NFT and update the NFT counter
    init(chainName: String, address: String) {
        self.chainName = chainName
        self.address = address
    }
  }

  // This interface exposes only the getIDs function
  pub resource interface DelegationsPublic {
    pub fun add(delegation: @Delegation)
    pub fun getDelegatedChains(): [String]
    pub fun getDelegation(chainName: String): &Delegation
  }


  // This is a resource that's going to contain all the NFTs any one account owns
  pub resource Delegations: DelegationsPublic {
    // This is a dictionary that maps ID integers with NFT resources
    // the @ indicates that we're working with a resource
    pub var delegations: @{String: Delegation}

    // This function will deposit an NFT into the collection
    // Takes in a variable called token of type NFT that's a resource
    pub fun add(delegation: @Delegation) {
      emit DelegationAdded(chainName: delegation.chainName, operator: delegation.address, caller: self.owner?.address)

      self.delegations[delegation.chainName] <-! delegation
    }

    pub fun remove(chainName: String): @Delegation {
      let delegation <- self.delegations.remove(key: chainName) ??
        panic("Invalid delegation for chainName")

      emit DelegationRemoved(chainName: delegation.chainName, operator: delegation.address, caller: self.owner?.address)

      return <- delegation
    }

    // Returns an array of strings
    pub fun getDelegatedChains(): [String] {
      // The keys in the delegations dictionary are the chains
      return self.delegations.keys
    }

    pub fun getDelegation(chainName: String): &Delegation {
      return (&self.delegations[chainName.toLower()] as &Delegation?)!
    }

    init() {
      // All resource values MUST be initiated so we make it empty!
      self.delegations <- {}
    }

    // This burns the ENTIRE collection (i.e. every NFT the user owns)
    destroy () {
      destroy self.delegations
    }
  }

  pub fun createDelegations(): @Delegations {
    return <- create Delegations()
  }

  pub fun addDelegation(
     recipient: &{DelegationsPublic},
     chainName: String,
     address: String
  ) {
    var newDelegation <- create Delegation(chainName: chainName.toLower(), address: address.toLower())
    recipient.add(delegation: <- newDelegation)
  }

  init() {
    self.DelegationStoragePath = /storage/Identity
    self.DelegationPublicPath = /public/Identity

     // Create a Collection for the deployer
    let delegations <- create Delegations()
    self.account.save(<-delegations, to: self.DelegationStoragePath)

    self.account.link<&Identity.Delegations{Identity.DelegationsPublic}>(
      self.DelegationPublicPath,
      target: self.DelegationStoragePath
    )
  }
}
