import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {
  InjectedConnector,
  UserRejectedRequestError,
} from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

import SetDelegation from './SetDelegation'
import { CHAINS, CHAINS_MAP, Delegations, getEVMContract } from '../utils'

const walletConnect = new WalletConnectConnector({
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
})

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 10, 42, 31337, 42161],
})

const EVMConnector = ({ setUser, setLoading, user }: any) => {
  const [delegations, setDelegations] = useState<Delegations>()
  const [lookupDelegations, setLookupDelegations] = useState<string[]>()

  const { chainId, account, activate, setError, active, library } =
    useWeb3React<Web3Provider>()

  const Identity = useMemo(() => getEVMContract(library), [library])

  const fetchDelegations = useCallback(
    async (address: string) => {
      setLoading(true)
      try {
        const delegationsToBeAdded: Delegations = {}
        const chainIds = Object.keys(CHAINS)
        for (let i = 0; i < chainIds.length; i++) {
          const delegation = await Identity.getDelegation(address, chainIds[i])
          if (delegation) {
            delegationsToBeAdded[Number(chainIds[i])] =
              await Identity.getDelegation(address, chainIds[i])
          }
        }

        setDelegations(delegationsToBeAdded)
      } catch (error) {
        console.log(error)
        alert('Error getting EVM delegations')
      }
      setLoading(false)
    },
    [Identity, setDelegations, setLoading]
  )

  const fetchLookupDelegations = useCallback(
    async (account: string) => {
      setLoading(true)
      try {
        const lookupDelegationsToBeAdded: string[] = []
        const delegationLookupLength = await Identity.getLookupLength(account)

        for (let i = 0; i < delegationLookupLength; i++) {
          const lookup = await Identity.getLookup(account, i)
          if (lookup !== '0x0000000000000000000000000000000000000000') {
            lookupDelegationsToBeAdded.push(lookup)
          }
        }

        setLookupDelegations(lookupDelegationsToBeAdded)

        const delegationsToBeAdded: Delegations = {}

        setDelegations(delegationsToBeAdded)
      } catch (error) {
        console.log(error)
        alert('Error getting EVM delegations')
      }
      setLoading(false)
    },
    [setDelegations, Identity, setLoading]
  )

  useEffect(() => {
    if (active && account && (!user || user[CHAINS_MAP.EVM] !== account)) {
      setUser({ ...user, [CHAINS_MAP.EVM]: account })
      fetchDelegations(account)
    }
  }, [account, active, setUser, user, fetchDelegations])

  useEffect(() => {
    if (user && user[CHAINS_MAP.FLOW]) {
      fetchLookupDelegations(user[CHAINS_MAP.FLOW])
    }
  }, [user, fetchLookupDelegations])

  const onConnectWitInjected = () => {
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

  const onConnectWithWalletConnect = () => {
    activate(
      walletConnect,
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

  const onSetDelegation = async (chain: number, address: string) => {
    if (user && user[CHAINS_MAP.EVM]) {
      setLoading(true)
      try {
        const transaction = await Identity.setDelegation(chain, address)
        const receipt = await transaction.wait()

        console.log(
          'Testnet explorer link:',
          `https://goerli.etherscan.io/tx/${receipt.hash}`
        )
        console.log(receipt.hash)
        fetchDelegations(user[CHAINS_MAP.EVM])
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
      <p className="title">EVM</p>
      {active && user && user[CHAINS_MAP.EVM] ? (
        <>
          <p>Account: {user[CHAINS_MAP.EVM]}</p>
          <p>ChainID: {chainId} connected</p>
          <SetDelegation onSetDelegation={onSetDelegation} />
        </>
      ) : (
        <>
          <button type="button" onClick={onConnectWitInjected}>
            Connect with Metamask
          </button>
          <button onClick={onConnectWithWalletConnect}>
            Connect with WalletConnect
          </button>
        </>
      )}
      {delegations && (
        <>
          <p>Delegations</p>
          <div className="delegations">
            {Object.keys(delegations).map((chainId: string, index: number) => (
              <p key={index}>
                {CHAINS[Number(chainId)]}: {delegations[Number(chainId)]}
              </p>
            ))}
          </div>
        </>
      )}
      {lookupDelegations && (
        <>
          <p>Lookup Delegations</p>
          <div className="delegations">
            {lookupDelegations.map((address: string, index: number) => (
              <p key={index}>{address}</p>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default EVMConnector
