import React, { useState, useEffect } from "react";
import logo from './logo.svg';

// @ts-ignore
import * as fcl from "@onflow/fcl";
// @ts-ignore
import * as types from "@onflow/types";

import { addDelegation as addDelegationScript } from "./cadence/transactions/addDelegation";
import { getDelegations as getDelegationsScript, getDelegation as getDelegationScript, getDelegation } from "./cadence/scripts/getDelegations";

import './App.css';

fcl.config({
  "flow.network": "testnet",
  "app.detail.title": "Identity", // Change the title!
  "accessNode.api": "https://rest-testnet.onflow.org",
  "app.detail.icon": "https://placekitten.com/g/200/200",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
});

type User = {
  addr: String
}

type Delegations = {
  [key: string]: string
}

function App() {
  const [ user, setUser ] = useState<User>();
  const [ delegations, setDelegations ] = useState<Delegations>();

  const logIn = () => {
    fcl.authenticate();
};

const logOut = () => {
    fcl.unauthenticate();
};

useEffect(() => {
  // This listens to changes in the user objects
  // and updates the connected user
  fcl.currentUser().subscribe(setUser);
}, [])

const RenderLogin = () => {
  return (
    <div>
      <button className="cta-button button-glow" onClick={() => logIn()}>
        Log In
      </button>
    </div>
  );
};

const RenderLogout = () => {
  if (user && user.addr) {
    return (
      <div className="logout-container">
        <button className="cta-button logout-btn" onClick={() => logOut()}>
          ❎ {"  "}
          {user.addr.substring(0, 6)}...{user.addr.substring(user.addr.length - 4)}
        </button>
      </div>
    );
  }
  return null;
};

const addDelegation = async() => {
  if (user && user.addr) {
    try {
      const transactionId = await fcl.mutate({
        cadence: `${addDelegationScript}`,
        args: (arg: (...args:any) => any) => [
          arg(user.addr, types.Address), //address to which the NFT should be minted
          arg('Ethereum', types.String), // Name
          arg('0xE4d3bA99FfDAE47c003F1756c01d8e7eE8fEF7C9', types.String), // Description
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        limit: 99
      })
      console.log("Minting NFT now with transaction ID", transactionId);
      const transaction = await fcl.tx(transactionId).onceSealed();
      console.log("Testnet explorer link:", `https://testnet.flowscan.org/transaction/${transactionId}`);
      console.log(transaction);
      alert("NFT minted successfully!")
    } catch (error) {
      console.log(error);
      alert("Error minting NFT, please check the console for error details!")
    }
  }
}

const getDelegations = async () => {
  if (user && user.addr) {
    try {
      const delegationsKeys = await fcl.query({
        cadence: `${getDelegationsScript}`,
        args: (arg: (...args:any) => any) => [
          arg(user.addr, types.Address), //address to which the NFT should be minted
        ],
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        limit: 99
      })

      const delegations: Delegations = {}
      for (let i = 0; i < delegationsKeys.length; i++) {
        const delegation = await fcl.query({
          cadence: `${getDelegationScript}`,
          args: (arg: (...args:any) => any) => [
            arg(user.addr, types.Address), //address to which the NFT should be minted
            arg(delegationsKeys[i], types.String)
          ],
          proposer: fcl.currentUser,
          payer: fcl.currentUser,
          limit: 99
        })

        delegations[delegation.chainName] = delegation.address
        const res = await fetch(`https://api.opensea.io/api/v1/assets?owner=${delegation.address}`)
        const data = await res.json()
        console.log(data)
      }

      setDelegations(delegations)

    } catch(err) {console.log(err)}
  }
}

const RenderAddDelegationButton = () => (
    <div>
      <button className="cta-button button-glow" onClick={() => addDelegation()}>
        Add Delegation
      </button>
    </div>
  );

const RenderDelegations = () => (delegations ? <div className="delegations">
      {Object.keys(delegations).map((chainName: string, index: number) =>
        (<p key={index}>`{chainName}: {delegations[chainName]}`</p>)
      )}
    </div> : null)

  return (
    <div className="App">
      <RenderLogout />
      {user && user.addr ? "Wallet connected!" : <RenderLogin />}
      {user && user.addr && <button onClick={getDelegations}>Get Delegations</button>}
      {user && user.addr && <RenderAddDelegationButton/>}
     <RenderDelegations />
    </div>
  );
}

export default App;
