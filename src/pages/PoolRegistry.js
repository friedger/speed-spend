import React from 'react';

import { useStxAddresses } from '../lib/hooks';
import { PoolList } from '../components/PoolList';
import { PoolRegister } from '../components/PoolRegister';

export default function PoolRegistry(props) {
  const { ownerStxAddress } = useStxAddresses();

  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Pool Registry</h1>
        </div>

        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <PoolList ownerStxAddress={ownerStxAddress} />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <PoolRegister ownerStxAddress={ownerStxAddress} />
        </div>

        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
            (Read the technical details at the{' '}
            <a href="https://gitlab.com/riot.ai/clarity-pool-registry">source code repo</a>
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
            <li className="list-group-item">Select the pool you trust</li>
            <li className="list-group-item">
              Enter the amount, duration, and reward address to define how you would like to stack
              and click delegate.
            </li>
            <li className="list-group-item">
              Wait for the pool admin to do the necessary and collect your rewards.
            </li>
            <li className="list-group-item"></li>
          </ul>
        </div>
      </div>
    </main>
  );
}
