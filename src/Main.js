import React from 'react';
import Profile from './Profile';

import { SpendField } from './SpendField';
import { BetButton } from './BetButton';
import { OwnerAddressSpendField } from './OwnerAddressSpendField';
import { useBlockstack } from 'react-blockstack';
import { getStacksAccount } from './StacksAccount';
import { addressToString } from '@blockstack/stacks-transactions';
import { UnHodlButton } from './UnHodlButton';
import { HodlButton } from './HodlButton';

export default function Main(props) {
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
          <h5 className="card-title">Speed Spend</h5>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <SpendField title="Send 1000 uSTX to" path="note" placeholder="Username" />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <OwnerAddressSpendField
            title="Send 1000 uSTX to"
            path="note"
            placeholder="Username"
            stxAddress={ownerStxAddress}
          />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h5 className="card-title pt-4">Hodl - Send between your own accounts</h5>
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

        <div className="col-xs-10 col-md-8 mx-auto  px-4">
          <hr />
        </div>

        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h5 className="card-title">Flip Coin with Jackpot</h5>
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
              Toggle the switch. Yellow on blue means "HEADS", Blue on yellow means "TAILS"
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

        <div className="col-xs-10 col-md-8 mx-auto  px-4">
          <hr />
        </div>

        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h5 className="card-title">Flip Coin At Two</h5>
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
