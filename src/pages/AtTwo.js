import React from 'react';

import { BetButton } from '../components/BetButton';
import { useBlockstack } from 'react-blockstack';

export default function AtTwo(props) {
  const { userData } = useBlockstack();
  const ownerStxAddress = userData.profile.stxAddress;
  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Flip Coin At Two</h1>
        </div>

        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <BetButton jackpot={false} ownerStxAddress={ownerStxAddress} />
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
              Find a friend to play against in real life and share the link to this game. Agree who
              bets on "HEADS" and who on "TAILS".
            </li>
            <li className="list-group-item">
              Toggle the switch. Yellow on blue means "HEADS", Blue on yellow means "TAILS"
            </li>
            <li className="list-group-item">
              Click the <i>Bet ..</i> button to bet 1000 uSTX.
            </li>
            <li className="list-group-item">
              Wait until your friend played as well and refresh the account balance. You should see
              1000 uSTX less in your account.
            </li>
            <li className="list-group-item">
              Ask somebody else to play the same game (Flip Coin At Two) and then after a few
              minutes check the balance again to see whether you won.
            </li>
            <li className="list-group-item">
              You can also search for your transcation and your friend's transaction at the
              <a href="https://testnet-explorer.blockstack.org/transactions">
                Testnet Explorer
              </a>{' '}
              and check the next flip-coin-at-two transaction above your transactions. It contains
              three transfers: One is the transfer of the player (1000uSTX), one is a fee paid into
              the jackpot of Flip Coin with Jackpot game and one is either a transfer to you or to
              your friend.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
