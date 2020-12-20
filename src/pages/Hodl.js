import React from 'react';

import { UnHodlButton } from '../components/UnHodlButton';
import { HodlButton } from '../components/HodlButton';
import { useStxAddresses } from '../lib/hooks';

export default function Hodl(props) {
  const { ownerStxAddress, appStxAddress } = useStxAddresses();

  return (
    <main className="panel-welcome mt-5 container">
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
