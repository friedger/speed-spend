import React from 'react';
import Profile from '../Profile';

import { BetButton } from '../BetButton';
import { useBlockstack } from 'react-blockstack';
import { getStacksAccount } from '../StacksAccount';
import { addressToString } from '@blockstack/stacks-transactions';

export default function Jackpot(props) {
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
          <h1 className="card-title">Flip Coin with Jackpot</h1>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <BetButton jackpot={true} ownerStxAddress={ownerStxAddress} />
        </div>

        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
            (Read the technical details at the{' '}
            <a href="https://github.com/friedger/clarity-smart-contracts/blob/master/docs/flip-coin.md">
              source code repo
            </a>
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
            <li className="list-group-item">
              Hodl some STXs for speed spend: Go to the "Hodl" tab and follow the instructions
              there.
            </li>
            <li className="list-group-item">
              Play the game: Toggle the switch. Yellow on blue means "HEADS", Blue on yellow means
              "TAILS"
            </li>
            <li className="list-group-item">
              Click the <i>Bet ..</i> button to bet 1000 uSTX.
            </li>
            <li className="list-group-item">
              Wait a few minutes and refresh the account balance. You should see 1000 uSTX less in
              your account.
            </li>
            <li className="list-group-item">
              Ask somebody else to play the same game (Flip Coin with Jackpot) and then after a few
              minutes check the balance again to see whether you won.
            </li>
            <li className="list-group-item">
              You can also search for your transcation at the
              <a href="https://testnet-explorer.blockstack.org/transactions">
                Testnet Explorer
              </a>{' '}
              and check the flip-coin-jackpot transaction above your transaction. If it contains two
              transfer events you won the jackpot!
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
