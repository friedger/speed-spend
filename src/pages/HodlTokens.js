import React from 'react';

import { useBlockstack } from 'react-blockstack';
import { getStacksAccount } from '../lib/account';
import { addressToString } from '@stacks/transactions';
import { BuyHodlTokensButton } from '../components/BuyHodlTokensButton';
import { HodlTokenButton } from '../components/HodlTokenButton';
import { UnHodlTokenButton } from '../components/UnHodlTokenButton';

export default function Hodl(props) {
  const { userData } = useBlockstack();
  const { address } = getStacksAccount(userData.appPrivateKey);
  const appStxAddress = addressToString(address);
  const ownerStxAddress = userData.profile.stxAddress;
  return (
    <main className="panel-welcome mt-5 container">
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
        </div>
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <HodlTokenButton
            placeholder="amount"
            ownerStxAddress={ownerStxAddress}
            appStxAddress={appStxAddress}
          />
          <UnHodlTokenButton placeholder="amount" ownerStxAddress={ownerStxAddress} />
        </div>
        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              Hodl token have two states
              <ul>
                <li>spendable and </li>
                <li>hodled</li>
              </ul>
            </li>
            <li className="list-group-item">
              If you own hodled Hodl tokens then you will be able to play the betting game in the
              future! For now, just hodl them :-)
            </li>
            <li className="list-group-item">Buy 10 Hodl tokens first (10.000 available)</li>
            <li className="list-group-item">Check the transaction whether tokens were sent.</li>
            <li className="list-group-item">Then hodl these 10 tokens.</li>
            <li className="list-group-item">Check the balance to see whether tokens were sent.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
