import React from 'react';

import { PoxLiteRedeem } from '../components/PoxLiteRedeem';
import { PoxLiteDeposit } from '../components/PoxLiteDeposit';
import { useStxAddresses } from '../lib/hooks';

export default function PoxLite({ userSession }) {
  const { ownerStxAddress } = useStxAddresses();

  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Pox Lite</h1>
        </div>

        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <PoxLiteDeposit ownerStxAddress={ownerStxAddress} userSession={userSession} />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <PoxLiteRedeem ownerStxAddress={ownerStxAddress} userSession={userSession} />
        </div>

        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
            (Read the technical details at the{' '}
            <a href="https://github.com/unclematis/pox-lite">source code repo</a>
            .)
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              Claim test tokens from the faucet to get 500,000 uSTX.
            </li>
            <li className="list-group-item">
              Wait a few minutes and refresh the account balance. You should see 500,000 uSTX more
              on your account.
            </li>
            <li className="list-group-item">Deposit some STX.</li>
            <li className="list-group-item">
              Check your balance for the stinger token. if you have won some stinger tokens.
            </li>
            <li className="list-group-item">Redeem your stinger tokens for STX.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
