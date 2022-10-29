import React, { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {
  InjectedConnector,
  UserRejectedRequestError,
} from '@web3-react/injected-connector'

// @ts-ignore
import * as fcl from '@onflow/fcl'
// @ts-ignore
import * as types from '@onflow/types'

import { setDelegation as setDelegationScript } from './cadence/transactions/setDelegation'
import {
  getDelegations as getDelegationsScript,
  getDelegation as getDelegationScript,
  geLookupByAddress as geLookupByAddressScript,
} from './cadence/scripts/getDelegations'

import './App.css'

const CHAINS: { [key: number]: string } = {
  1: 'EVM: Ethereum, Polygon, Optimism, etc...',
  2: 'Flow',
  3: 'BSC',
  4: 'TRON',
}

enum CHAINS_MAP {
  INVALID,
  EVM,
  FLOW,
  BSC,
  TRON,
}

fcl.config({
  'flow.network': 'testnet',
  'app.detail.title': 'Identity', // Change the title!
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'app.detail.icon': 'https://placekitten.com/g/200/200',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
})

type User = {
  [key in CHAINS_MAP]?: string
}

type Delegations = {
  [key: number]: string
}

function App() {
  const [user, setUser] = useState<User>()
  const [delegations, setDelegations] = useState<Delegations>()

  const logIn = () => {
    fcl.authenticate()
  }

  const logOut = () => {
    fcl.unauthenticate()
  }

  useEffect(() => {
    // This listens to changes in the user objects
    // and updates the connected user
    fcl
      .currentUser()
      .subscribe((flowAccount: { addr: string }) =>
        setUser({ ...user, [CHAINS_MAP.FLOW]: flowAccount.addr })
      )
  }, [])

  const RenderLogin = () => {
    return (
      <div>
        <button className="cta-button button-glow" onClick={() => logIn()}>
          Connect to Flow
        </button>
      </div>
    )
  }

  const RenderConnectMetamask = () => {
    const {
      chainId,
      account,
      activate,
      deactivate,
      setError,
      active,
      library,
      connector,
    } = useWeb3React<Web3Provider>()
    const injected = new InjectedConnector({
      supportedChainIds: [1, 3, 4, 5, 10, 42, 31337, 42161],
    })
    const onClickConnect = () => {
      activate(
        injected,
        (error) => {
          if (error instanceof UserRejectedRequestError) {
            // ignore user rejected error
            console.log('user refused')
          } else {
            setError(error)
          }
        },
        false
      )
    }

    const onClickDisconnect = () => {
      deactivate()
    }

    useEffect(() => {
      console.log('a', user, account)
      if (active && account && (!user || user[CHAINS_MAP.EVM] !== account))
        setUser({ ...user, [CHAINS_MAP.EVM]: account })
    }, [user, active])

    return (
      <div>
        {active && user && user[CHAINS_MAP.EVM] ? (
          <div>
            <button type="button" onClick={onClickDisconnect}>
              Account: {user[CHAINS_MAP.EVM]}
            </button>
            <p>ChainID: {chainId} connected</p>
          </div>
        ) : (
          <div>
            <button type="button" onClick={onClickConnect}>
              Connect to EVM
            </button>
            <p> not connected </p>
          </div>
        )}
      </div>
    )
  }

  const RenderLogout = () => {
    if (user && user[CHAINS_MAP.FLOW]) {
      return (
        <div className="logout-container">
          <button className="cta-button logout-btn" onClick={() => logOut()}>
            ❎ {'  '}
            {user[CHAINS_MAP.FLOW]!.substring(0, 6)}...
            {user[CHAINS_MAP.FLOW]!.substring(
              user[CHAINS_MAP.FLOW]!.length - 4
            )}
          </button>
        </div>
      )
    }
    return null
  }

  const setDelegation = async () => {
    if (user && user[CHAINS_MAP.FLOW]) {
      try {
        const transactionId = await fcl.mutate({
          cadence: `${setDelegationScript}`,
          args: (arg: (...args: any) => any) => [
            arg(CHAINS_MAP.EVM.toString(), types.UInt8), // Name
            arg('0xas', types.String), // Description
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          limit: 99,
        })
        console.log('Setting delegation', transactionId)
        const transaction = await fcl.tx(transactionId).onceSealed()
        console.log(
          'Testnet explorer link:',
          `https://testnet.flowscan.org/transaction/${transactionId}`
        )
        console.log(transaction)
        alert('Delegation set successfully!')
      } catch (error) {
        console.log(error)
        alert('Error minting NFT, please check the console for error details!')
      }
    }
  }

  const getDelegations = async () => {
    if (user && user[CHAINS_MAP.FLOW]) {
      try {
        const delegationsKeys = await fcl.query({
          cadence: `${getDelegationsScript}`,
          args: (arg: (...args: any) => any) => [
            arg(user[CHAINS_MAP.FLOW], types.Address),
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          limit: 99,
        })

        const delegations: Delegations = {}
        for (let i = 0; i < delegationsKeys.length; i++) {
          const delegation = await fcl.query({
            cadence: `${getDelegationScript}`,
            args: (arg: (...args: any) => any) => [
              arg(user[CHAINS_MAP.FLOW], types.Address),
              arg(delegationsKeys[i].rawValue, types.UInt8),
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            limit: 99,
          })

          delegations[delegation.chainId.rawValue] = delegation.address
          const res = await fetch(
            `https://api.opensea.io/api/v1/assets?owner=${delegation.address}`
          )
          const data = await res.json()
          console.log(data)
        }

        setDelegations(delegations)
      } catch (err) {
        console.log(err)
      }
    }
  }

  const getDelegationsByLookup = async () => {
    if (user && user[CHAINS_MAP.EVM]) {
      try {
        const delegationsByLookup = await fcl.query({
          cadence: `${geLookupByAddressScript}`,
          args: (arg: (...args: any) => any) => [
            arg(user[CHAINS_MAP.EVM]?.toString().toLowerCase(), types.String),
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          limit: 99,
        })

        console.log(delegationsByLookup)

        // const delegationsKeys = await fcl.query({
        //   cadence: `${getDelegationsScript}`,
        //   args: (arg: (...args: any) => any) => [
        //     arg(user[CHAINS_MAP.FLOW], types.Address),
        //   ],
        //   proposer: fcl.currentUser,
        //   payer: fcl.currentUser,
        //   limit: 99,
        // })

        // const delegations: Delegations = {}
        // for (let i = 0; i < delegationsKeys.length; i++) {
        //   const delegation = await fcl.query({
        //     cadence: `${getDelegationScript}`,
        //     args: (arg: (...args: any) => any) => [
        //       arg(user[CHAINS_MAP.FLOW], types.Address),
        //       arg(delegationsKeys[i].rawValue, types.UInt8),
        //     ],
        //     proposer: fcl.currentUser,
        //     payer: fcl.currentUser,
        //     limit: 99,
        //   })

        //   delegations[delegation.chainId.rawValue] = delegation.address
        //   const res = await fetch(
        //     `https://api.opensea.io/api/v1/assets?owner=${delegation.address}`
        //   )
        //   const data = await res.json()
        //   console.log(data)
        // }

        // setDelegations(delegations)
      } catch (err) {
        console.log(err)
      }
    }
  }

  const RenderAddDelegationButton = () => (
    <div>
      <button
        className="cta-button button-glow"
        onClick={() => setDelegation()}
      >
        Add Delegation
      </button>
    </div>
  )

  const RenderDelegations = () =>
    delegations ? (
      <div className="delegations">
        {Object.keys(delegations).map((chainId: string, index: number) => (
          <p key={index}>
            {CHAINS[Number(chainId)]}: {delegations[Number(chainId)]}
          </p>
        ))}
      </div>
    ) : null

  return (
    <div className="App">
      <RenderLogout />
      {user && user[CHAINS_MAP.FLOW] ? (
        'Flow Wallet connected!'
      ) : (
        <RenderLogin />
      )}

      <RenderConnectMetamask />
      {user && user[CHAINS_MAP.FLOW] && (
        <button onClick={getDelegations}>Get Delegations</button>
      )}
      {user && user[CHAINS_MAP.EVM] && (
        <button onClick={getDelegationsByLookup}>
          Get Delegations by Lookup
        </button>
      )}
      {user && user[CHAINS_MAP.FLOW] && <RenderAddDelegationButton />}
      <RenderDelegations />
    </div>
  )
}

export default App
