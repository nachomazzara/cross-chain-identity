import React, { useState, useEffect, useCallback } from 'react'

// @ts-ignore
import * as fcl from '@onflow/fcl'
// @ts-ignore
import * as types from '@onflow/types'

import { setDelegation as setDelegationScript } from '../cadence/transactions/setDelegation'
import {
  getDelegations as getDelegationsScript,
  getDelegation as getDelegationScript,
  geLookupByAddress as geLookupByAddressScript,
} from '../cadence/scripts/getDelegations'

fcl.config({
  'flow.network': 'testnet',
  'app.detail.title': 'Identity',
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'app.detail.icon': 'https://placekitten.com/g/200/200',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
})

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

type Delegations = {
  [key: number]: string
}

const FlowConnector = ({ setUser, user }: any) => {
  const subscribeConnection = useCallback(() => {
    fcl.currentUser().subscribe((flowAccount: { addr: string }) => {
      setUser({ ...user, [CHAINS_MAP.FLOW]: flowAccount.addr })
      if (
        flowAccount.addr &&
        (!user || user[CHAINS_MAP.FLOW] !== flowAccount.addr)
      ) {
        fetchFlowDelegations(flowAccount.addr)
      }
    })
  }, [setUser, user])

  useEffect(() => {
    subscribeConnection()
  }, [subscribeConnection])

  const fetchLookupDelegations = useCallback(async () => {
    if (user && user[CHAINS_MAP.EVM] && user[CHAINS_MAP.FLOW]) {
      console.log('asd')
      try {
        const delegationsByLookup = await fcl.query({
          cadence: `${geLookupByAddressScript}`,
          args: (arg: (...args: any) => any) => [
            arg(user.toLowerCase(), types.String),
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
  }, [user])

  useEffect(() => {
    fetchLookupDelegations()
  }, [fetchLookupDelegations])

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

  const [delegations, setDelegations] = useState<Delegations>()

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

  const fetchFlowDelegations = async (user: string) => {
    try {
      const delegationsKeys = await fcl.query({
        cadence: `${getDelegationsScript}`,
        args: (arg: (...args: any) => any) => [arg(user, types.Address)],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        limit: 99,
      })

      const delegations: Delegations = {}
      for (let i = 0; i < delegationsKeys.length; i++) {
        const delegation = await fcl.query({
          cadence: `${getDelegationScript}`,
          args: (arg: (...args: any) => any) => [
            arg(user, types.Address),
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

  return (
    <div className="connector">
      <p className="title">FLOW</p>
      {!user ||
        (!user[CHAINS_MAP.FLOW] && (
          <button className="cta-button button-glow" onClick={fcl.authenticate}>
            Connect
          </button>
        ))}
      {user && user[CHAINS_MAP.FLOW] && (
        <div>
          <div className="logout-container">
            <button
              className="cta-button logout-btn"
              onClick={fcl.unauthenticate}
            >
              ❎ {'  '}
              {user[CHAINS_MAP.FLOW]!.substring(0, 6)}...
              {user[CHAINS_MAP.FLOW]!.substring(
                user[CHAINS_MAP.FLOW]!.length - 4
              )}
            </button>
          </div>
          {user && user[CHAINS_MAP.FLOW] && <RenderAddDelegationButton />}
          {delegations && (
            <div className="delegations">
              {Object.keys(delegations).map(
                (chainId: string, index: number) => (
                  <p key={index}>
                    {CHAINS[Number(chainId)]}: {delegations[Number(chainId)]}
                  </p>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FlowConnector
