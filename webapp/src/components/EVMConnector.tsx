import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {
  InjectedConnector,
  UserRejectedRequestError,
} from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

import SetDelegation from './SetDelegation'
import {
  CHAINS,
  CHAINS_MAP,
  Delegations,
  getEVMContract,
  NFT,
  getEVMAccountLink,
  getFlowAccountLink,
} from '../utils'

const walletConnect = new WalletConnectConnector({
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
})

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 10, 42, 31337, 42161],
})

const EVMConnector = ({
  user,
  userLookups,
  setUser,
  setUserLookups,
  setLoading,
  nfts,
  setNFTs,
}: any) => {
  const [delegations, setDelegations] = useState<Delegations>()
  const flowLookups = useRef<{} | null>(null)
  const refNFTs = useRef<string[] | null>(null)

  const { chainId, account, activate, setError, active, library, deactivate } =
    useWeb3React<Web3Provider>()

  const Identity = useMemo(() => getEVMContract(library), [library])

  const fetchAccountNFTs = async (account: string) => {
    // store every lookup Delegation
    const res = await fetch(
      `https://api.opensea.io/api/v1/assets?owner=${account}&limit=50`
    )
    const data = await res.json()
    return data && data.assets
      ? data.assets.reduce(
          (nftsToBeAdded: { [key: string]: NFT }, asset: any) => {
            if (asset.image_thumbnail_url) {
              nftsToBeAdded[asset.id] = {
                thumbnail: asset.image_thumbnail_url,
                id: asset.id,
                name: asset.name,
                link: asset.permalink,
              }
            }
            return nftsToBeAdded
          },
          {}
        )
      : {}
  }

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

  const fetchNFTs = useCallback(
    async (account: string) => {
      setLoading(true)
      try {
        const nftsToBeAdded = await fetchAccountNFTs(account)
        refNFTs.current = nftsToBeAdded
        setNFTs({
          ...nfts,
          [CHAINS_MAP.EVM]: { ...nfts[CHAINS_MAP.EVM], ...nftsToBeAdded },
        })
      } catch (err) {
        console.log(err)
      }
      setLoading(false)
    },
    [setLoading, setNFTs, nfts]
  )

  const fetchLookupDelegations = useCallback(
    async (account: string) => {
      setLoading(true)
      try {
        const lookupDelegationsToBeAdded: string[] = []
        let nftsToBeAdded: { [key: string]: NFT } = {}

        const delegationLookupLength = await Identity.getLookupLength(account)
        for (let i = 0; i < delegationLookupLength; i++) {
          const lookup = await Identity.getLookup(account, i)

          if (lookup !== '0x0000000000000000000000000000000000000000') {
            lookupDelegationsToBeAdded.push(lookup)

            const nfts = await fetchAccountNFTs(lookup)

            nftsToBeAdded = { ...nftsToBeAdded, ...nfts }
          }
        }

        flowLookups.current = lookupDelegationsToBeAdded
        setUserLookups({
          ...userLookups,
          [CHAINS_MAP.FLOW]: lookupDelegationsToBeAdded,
        })
        setNFTs({
          ...nfts,
          [CHAINS_MAP.EVM]: { ...nfts[CHAINS_MAP.EVM], ...nftsToBeAdded },
        })
      } catch (error) {
        console.log(error)
        alert('Error getting EVM lookup delegations')
      }
      setLoading(false)
    },
    [Identity, setLoading, setNFTs, nfts, userLookups, setUserLookups]
  )

  useEffect(() => {
    if (active && account && (!user || user[CHAINS_MAP.EVM] !== account)) {
      setUser({ ...user, [CHAINS_MAP.EVM]: account })
      fetchNFTs(account)
      if (chainId === 5) {
        fetchDelegations(account)
      }
    }
  }, [account, active, chainId, setUser, user, fetchDelegations, fetchNFTs])

  useEffect(() => {
    if (
      active &&
      account &&
      JSON.stringify(refNFTs.current) !== JSON.stringify(nfts[CHAINS_MAP.EVM])
    ) {
      fetchNFTs(account)
    }
  }, [account, active, nfts, fetchNFTs])

  useEffect(() => {
    if (
      user &&
      user[CHAINS_MAP.FLOW] &&
      JSON.stringify(flowLookups.current) !==
        JSON.stringify(userLookups[CHAINS_MAP.FLOW])
    ) {
      fetchLookupDelegations(user[CHAINS_MAP.FLOW])
    }
  }, [user, flowLookups, userLookups, fetchLookupDelegations])

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

  const onLogout = () => {
    setUser({ ...user, [CHAINS_MAP.EVM]: null })
    deactivate()
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
        alert('Error setting delegation')
      }
      setLoading(false)
    }
  }

  return (
    <div className="connector">
      <p className="title">{`EVM ${
        active && user && user[CHAINS_MAP.EVM] ? '⚡️' : ''
      }`}</p>
      {active && user && user[CHAINS_MAP.EVM] ? (
        chainId !== 5 ? (
          <>
            <p>
              As you are connected to chainId: {chainId}, you are only able to
              see the own and delegated NFTs. To set and see delegations, please
              switch to Goerli.
            </p>
          </>
        ) : (
          <div className="account">
            <p>
              Account:{' '}
              <a
                href={getEVMAccountLink() + user[CHAINS_MAP.EVM]}
                target="_blank"
                rel="noreferrer"
              >
                {user[CHAINS_MAP.EVM]}
              </a>
            </p>
            <p className="logout" onClick={onLogout}>
              ❌
            </p>
          </div>
        )
      ) : (
        <>
          <button className="button" onClick={onConnectWitInjected}>
            Connect with Metamask 🦊
          </button>
          <button className="button" onClick={onConnectWithWalletConnect}>
            Connect with WalletConnect 🚾
          </button>
        </>
      )}
      {delegations && (
        <div className="delegations-wrapper">
          <p className="title">Delegations</p>
          <p className="subtitle">
            Accounts that you have delegated the use of your NFTs
          </p>
          <div className="delegations">
            {Object.keys(delegations).length > 0 ? (
              Object.keys(delegations).map((chainId: string, index: number) => (
                <p key={index}>
                  🧵 <strong>{CHAINS[Number(chainId)]}:</strong>{' '}
                  <a
                    href={`${
                      Number(chainId) === CHAINS_MAP.FLOW
                        ? getFlowAccountLink()
                        : getEVMAccountLink()
                    }${delegations[Number(chainId)]}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {delegations[Number(chainId)]}
                  </a>{' '}
                </p>
              ))
            ) : (
              <p className="empty">No delegations set yet 🙃...</p>
            )}
          </div>
        </div>
      )}
      {userLookups && userLookups[CHAINS_MAP.EVM] && (
        <div className="lookups-wrapper">
          <p className="title">Lookup Delegations</p>
          <p className="subtitle">
            Accounts that have delegated the use of their NFTs
          </p>
          <div className="delegations">
            {userLookups[CHAINS_MAP.EVM].length > 0 ? (
              userLookups[CHAINS_MAP.EVM].map(
                (address: string, index: number) => (
                  <p key={index}>
                    🪢 <strong>{CHAINS[CHAINS_MAP.FLOW]}:</strong>{' '}
                    <a
                      href={getFlowAccountLink() + address}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {address}
                    </a>
                  </p>
                )
              )
            ) : (
              <p className="empty">No lookups found 😢...</p>
            )}
          </div>
        </div>
      )}
      {active && user && user[CHAINS_MAP.EVM] && chainId === 5 && (
        <SetDelegation onSetDelegation={onSetDelegation} />
      )}
    </div>
  )
}

export default EVMConnector
