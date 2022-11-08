import React, { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import {
  InjectedConnector,
  UserRejectedRequestError,
} from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

const walletConnect = new WalletConnectConnector({
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
})

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 10, 42, 31337, 42161],
})

enum CHAINS_MAP {
  INVALID,
  EVM,
  FLOW,
  BSC,
  TRON,
}

const EVMConnector = ({ setUser, user }: any) => {
  const { chainId, account, activate, setError, active } =
    useWeb3React<Web3Provider>()

  useEffect(() => {
    if (active && account && (!user || user[CHAINS_MAP.EVM] !== account)) {
      setUser({ ...user, [CHAINS_MAP.EVM]: account })
    }
  }, [account, active, setUser, user])

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

  return (
    <div className="connector">
      <p className="title">EVM</p>
      {active && user && user[CHAINS_MAP.EVM] ? (
        <>
          <p>Account: {user[CHAINS_MAP.EVM]}</p>
          <p>ChainID: {chainId} connected</p>
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
    </div>
  )
}

export default EVMConnector
