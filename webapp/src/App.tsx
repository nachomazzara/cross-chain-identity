import React, { useState } from 'react'

import EVMConnector from './components/EVMConnector'
import FlowConnector from './components/FlowConnector'

import './App.css'

enum CHAINS_MAP {
  INVALID,
  EVM,
  FLOW,
  BSC,
  TRON,
}

type User = {
  [key in CHAINS_MAP]?: string
}

function App() {
  const [user, setUser] = useState<User>({})
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const chainConnections: { [key: number]: JSX.Element } = {
    [CHAINS_MAP.EVM]: (
      <EVMConnector setUser={setUser} user={user} setLoading={setLoading} />
    ),
    [CHAINS_MAP.FLOW]: (
      <FlowConnector
        setUser={setUser}
        user={user}
        setLoading={setLoading}
        setImages={setImages}
      />
    ),
  }

  return (
    <div className="App">
      <div className={loading ? 'loader-container' : 'hide'}>
        <div className="spinner" />
      </div>
      <div className="connectors">
        {Object.keys(chainConnections).map((key) => (
          <div key={key} className="connector-wrapper">
            {chainConnections[Number(key)]}
          </div>
        ))}
      </div>
      <div className="nfts">
        <div>NFTs</div>
        <>
          {images.map((image: string, index: number) => (
            <img src={image} key={index} />
          ))}
        </>
      </div>{' '}
    </div>
  )
}

export default App
