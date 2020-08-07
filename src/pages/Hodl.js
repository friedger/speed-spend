import React from 'react';
import Profile from '../Profile';

import { useBlockstack } from 'react-blockstack';
import { getStacksAccount } from '../StacksAccount';
import { addressToString } from '@blockstack/stacks-transactions';
import { UnHodlButton } from '../UnHodlButton';
import { HodlButton } from '../HodlButton';
import { BuyHodlTokensButton } from '../BuyHodlTokensButton';

export default function Hodl(props) {
  const { userData } = useBlockstack();
  const { address } = getStacksAccount(userData.appPrivateKey);
  const appStxAddress = addressToString(address);
  const ownerStxAddress = userData.profile.stxAddress;
  return (
    <main className="panel-welcome mt-5 container">
      <div className="row">
        <div className="mx-auto col-sm-10 col-md-8 px-4">
          <Profile
            stxAddresses={{
              appStxAddress: appStxAddress,
              ownerStxAddress: ownerStxAddress,
            }}
          />
        </div>
      </div>
      <div className="col-xs-10 col-md-8 mx-auto  px-4">
        <hr />
      </div>
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title pt-4">Hodl</h1>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <BuyHodlTokensButton
            placeholder="amount"
            ownerStxAddress={ownerStxAddress}
            appStxAddress={appStxAddress}
          />
          <HodlButton
            placeholder="amount"
            ownerStxAddress={ownerStxAddress}
            appStxAddress={appStxAddress}
          />
          <UnHodlButton placeholder="amount" ownerStxAddress={ownerStxAddress} />
        </div>
        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Claim test tokens from the faucet to get 500k uSTX.</li>
            <li className="list-group-item">Wait a few minutes and refresh the account balance.</li>
            <li className="list-group-item">
              Enter the blockstack username of a friend (that signed in to this app already).
              Examples are
              <br />
              <em>openintents</em> <br />
              (which is the same as <em>openintents.id.blockstack</em>) <br />
              or
              <br /> <em>friedger.id</em>
            </li>
            <li className="list-group-item">
              Press the <i>Enter</i> key or click the <i>Send</i> button to send off the tokens.
            </li>
            <li className="list-group-item">
              Check the balance again (after a few seconds) to see whether tokens were sent.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
