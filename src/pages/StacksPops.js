import React from 'react';

import { MintStacksPopButton } from '../components/MintStacksPopButton';
import { useStxAddresses } from '../lib/hooks';

export default function StacksPops(props) {
  const { ownerStxAddress } = useStxAddresses();
  console.log({ ownerStxAddress });
  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Stacks Pops</h1>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <MintStacksPopButton ownerStxAddress={ownerStxAddress} />
        </div>
        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              Claim test tokens from the 
              <a href="https://explorer.stacks.co/sandbox/faucet?chain=testnet"  rel="noreferrer" target="_blank"> faucet </a> 
              to get 500,000 uSTX.

            </li>
            <li className="list-group-item">
              Wait a few minutes and refresh the account balance. You should see 500,000 uSTX more
              on your account.
            </li>
            <li className="list-group-item">Mint a pop</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
