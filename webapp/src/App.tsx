import React, { useState } from 'react'

import EVMConnector from './components/EVMConnector'
import FlowConnector from './components/FlowConnector'

import { CHAINS_MAP, CHAINS, User, UserLookups, NFTS } from './utils'

import './App.css'

function App() {
  const [user, setUser] = useState<User>({})
  const [userLookups, setUserLookups] = useState<UserLookups>({})
  const [nfts, setNFTs] = useState<NFTS>({})
  const [loading, setLoading] = useState(false)

  const chainConnections: { [key: number]: JSX.Element } = {
    [CHAINS_MAP.EVM]: (
      <EVMConnector
        user={user}
        userLookups={userLookups}
        setUser={setUser}
        setUserLookups={setUserLookups}
        setLoading={setLoading}
        nfts={nfts}
        setNFTs={setNFTs}
      />
    ),
    [CHAINS_MAP.FLOW]: (
      <FlowConnector
        user={user}
        userLookups={userLookups}
        setUser={setUser}
        setUserLookups={setUserLookups}
        setLoading={setLoading}
        nfts={nfts}
        setNFTs={setNFTs}
      />
    ),
  }

  return (
    <div className="App">
      <div className={loading ? 'loader-container' : 'hide'}>
        <div className="spinner" />
      </div>
      <div className="app-wrapper">
        <div className="connectors">
          {Object.keys(chainConnections).map((key) => (
            <div key={key} className="connector-wrapper">
              {chainConnections[Number(key)]}
            </div>
          ))}
        </div>
        <div className="nfts">
          <h1>NFTs 🎁</h1>
          <>
            {Object.keys(nfts).map((key) => {
              const chainNFTs = nfts[Number(key) as CHAINS_MAP]
              return (
                <div key={key}>
                  <h2>⛓ {CHAINS[Number(key)]}</h2>
                  <div className="nfts-wrapper">
                    {chainNFTs && Object.keys(chainNFTs).length > 0 ? (
                      Object.keys(chainNFTs).map((id) => (
                        <div className="nft-wrapper" key={id}>
                          <img
                            alt={chainNFTs[id].name}
                            src={chainNFTs[id].thumbnail}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="empty">No NFTs 😭...</p>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        </div>
      </div>
    </div>
  )
}

export default App
