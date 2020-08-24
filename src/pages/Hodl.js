import React from 'react';
import Profile from '../Profile';

import { useBlockstack } from 'react-blockstack';
import { getStacksAccount } from '../StacksAccount';
import { addressToString } from '@blockstack/stacks-transactions';
import { UnHodlButton } from '../UnHodlButton';
import { HodlButton } from '../HodlButton';

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
            <li className="list-group-item">
              Wait a few minutes and refresh the STX account balance.
            </li>
            <li className="list-group-item">
              Transfer some STXs to your apps address: Enter amount of 1000 into Hodl section, click
              "Hodl"
            </li>
            <li className="list-group-item">Wait a few minutes and refresh the Hodl balance.</li>
            <li className="list-group-item">
              Check the balance again (after a few seconds) to see whether tokens were sent.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
