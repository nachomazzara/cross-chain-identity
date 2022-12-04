import React, { useState, useEffect, useCallback, useRef } from 'react'

// @ts-ignore
import * as fcl from '@onflow/fcl'
// @ts-ignore
import * as types from '@onflow/types'

import SetDelegation from './SetDelegation'
import { CHAINS, CHAINS_MAP, Delegations, NFT } from '../utils'

import { setDelegation as setDelegationScript } from '../cadence/transactions/setDelegation'
import {
  getDelegations as getDelegationsScript,
  getDelegation as getDelegationScript,
  geLookupByAddress as geLookupByAddressScript,
} from '../cadence/scripts/getDelegations'

if (window.location.pathname === '/testnet') {
  fcl.config({
    'flow.network': 'testnet',
    'app.detail.title': 'Identity',
    'accessNode.api': 'https://rest-testnet.onflow.org',
    'app.detail.icon': 'https://placekitten.com/g/200/200',
    'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  })
} else {
  fcl.config({
    'flow.network': 'mainnet',
    'app.detail.title': 'Identity',
    'accessNode.api': 'https://rest-mainnet.onflow.org',
    'app.detail.icon': 'https://placekitten.com/g/200/200',
    'discovery.wallet': 'https://fcl-discovery.onflow.org/authn',
  })
}

const FlowConnector = ({
  setUser,
  user,
  setLoading,
  setNFTs,
  nfts,
  userLookups,
  setUserLookups,
}: any) => {
  const [delegations, setDelegations] = useState<Delegations>()
  const EVMLookups = useRef<string[] | null>(null)

  const fetchDelegations = useCallback(
    async (user: string) => {
      setLoading(true)
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
        }

        setDelegations(delegations)
      } catch (err) {
        console.log(err)
      }
      setLoading(false)
    },
    [setLoading, setDelegations]
  )

  const fetchNFTs = useCallback(
    async (account: string) => {
      setLoading(true)
      try {
        const nftsToBeAdded = await fetchAccountNFTs(account)
        setNFTs({
          ...nfts,
          [CHAINS_MAP.FLOW]: { ...nfts[CHAINS_MAP.FLOW], ...nftsToBeAdded },
        })
      } catch (err) {
        console.log(err)
      }
      setLoading(false)
    },
    [setLoading, setNFTs, nfts]
  )

  const subscribeConnection = useCallback(() => {
    fcl.currentUser().subscribe((flowAccount: { addr: string }) => {
      if (
        flowAccount.addr &&
        (!user || user[CHAINS_MAP.FLOW] !== flowAccount.addr)
      ) {
        setUser({ ...user, [CHAINS_MAP.FLOW]: flowAccount.addr })
        fetchDelegations(flowAccount.addr)
        fetchNFTs(flowAccount.addr)
      }
    })
  }, [setUser, user, fetchDelegations, fetchNFTs])

  useEffect(() => {
    subscribeConnection()
  })

  const fetchLookupDelegations = useCallback(
    async (account: string) => {
      try {
        const delegationsByLookup = await fcl.query({
          cadence: `${geLookupByAddressScript}`,
          args: (arg: (...args: any) => any) => [
            arg(account.toLowerCase(), types.String),
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          limit: 99,
        })
        if (delegationsByLookup) {
          let nftsToBeAdded: { [key: string]: NFT } = {}
          const lookupDelegationsToBeAdded: string[] = []
          const delegationsByLookupKeys = Object.keys(delegationsByLookup)

          for (let i = 0; i < delegationsByLookupKeys.length; i++) {
            lookupDelegationsToBeAdded.push(delegationsByLookupKeys[i])
            // store every lookup Delegation
            const nfts = await fetchAccountNFTs(delegationsByLookupKeys[i])

            nftsToBeAdded = { ...nftsToBeAdded, ...nfts }
          }

          EVMLookups.current = lookupDelegationsToBeAdded
          setUserLookups({
            ...userLookups,
            [CHAINS_MAP.EVM]: lookupDelegationsToBeAdded,
          })
          setNFTs({
            ...nfts,
            [CHAINS_MAP.FLOW]: { ...nfts[CHAINS_MAP.FLOW], ...nftsToBeAdded },
          })
        }
      } catch (err) {
        console.log(err)
      }
    },
    [setNFTs, nfts, userLookups, setUserLookups]
  )

  const fetchAccountNFTs = async (account: string) => {
    const res = await fetch(
      `https://api.matrixmarket.xyz/mart/v1/user/mainnet_flow-${account}/items/owned?pageSize=6`
    )
    const data = await res.json()
    return data && data.list
      ? data.list.reduce(
          (nftsToBeAdded: { [key: string]: NFT }, asset: any) => {
            nftsToBeAdded[asset.id] = {
              thumbnail: asset.thumbnail,
              id: asset.id,
              name: asset.name,
              link: '',
            }
            return nftsToBeAdded
          },
          {}
        )
      : {}
  }

  useEffect(() => {
    if (
      user &&
      user[CHAINS_MAP.EVM] &&
      JSON.stringify(EVMLookups.current) !==
        JSON.stringify(userLookups[CHAINS_MAP.EVM])
    ) {
      fetchLookupDelegations(user[CHAINS_MAP.EVM])
    }
  }, [user, EVMLookups, userLookups, fetchLookupDelegations])

  const onSetDelegation = async (chain: number, address: string) => {
    if (user && user[CHAINS_MAP.FLOW]) {
      setLoading(true)
      try {
        const transactionId = await fcl.mutate({
          cadence: `${setDelegationScript}`,
          args: (arg: (...args: any) => any) => [
            arg(chain.toString(), types.UInt8),
            arg(address, types.String),
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
        fetchDelegations(user[CHAINS_MAP.FLOW])
        alert('Delegation set successfully!')
      } catch (error) {
        console.log(error)
        alert('Error minting NFT, please check the console for error details!')
      }
      setLoading(false)
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
              {user[CHAINS_MAP.FLOW]}
            </button>
          </div>
          {user && user[CHAINS_MAP.FLOW] && (
            <SetDelegation onSetDelegation={onSetDelegation} />
          )}
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
      {userLookups && userLookups[CHAINS_MAP.FLOW] && (
        <>
          <p>Lookup Delegations</p>
          <div className="delegations">
            {userLookups[CHAINS_MAP.FLOW].map(
              (address: string, index: number) => (
                <p key={index}>{address}</p>
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default FlowConnector
