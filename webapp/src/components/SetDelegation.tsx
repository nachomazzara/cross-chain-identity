import React, { useState } from 'react'

const CHAINS: { [key: number]: string } = {
  1: 'EVM: Ethereum, Polygon, Optimism, etc...',
  2: 'Flow',
  3: 'BSC',
  4: 'TRON',
}

const SetDelegation = ({ onSetDelegation }: any) => {
  const [chain, setChain] = useState<string>(Object.keys(CHAINS).shift()!)
  const [address, setAddress] = useState<string>('')

  const onSubmit = (event: any) => {
    onSetDelegation(chain, address)
    event.preventDefault()
  }

  const handleChainChange = (event: any) => setChain(event.target.value)
  const handleInputChange = (event: any) => setAddress(event.target.value)

  return (
    <div>
      <form>
        <label>
          Set Delegation
          <select value={chain} onChange={handleChainChange}>
            {Object.keys(CHAINS).map((key) => (
              <option key={key} value={key}>
                {CHAINS[Number(key)]}
              </option>
            ))}
          </select>
        </label>
        <input type="text" onChange={handleInputChange} value={address} />
        <input
          type="submit"
          value="Add Delegation"
          className="cta-button button-glow"
          onClick={onSubmit}
        />
      </form>
    </div>
  )
}

export default SetDelegation
