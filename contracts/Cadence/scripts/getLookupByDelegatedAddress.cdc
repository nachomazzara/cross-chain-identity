import Identity from 0xf8d6e0586b0a20c7

pub fun main(address: String): {Address: Bool}? {
  return Identity.getLookupsByDelegatedAddress(address: address)
}
