import React from 'react';
import Profile from '../Profile';

import { useBlockstack } from 'react-blockstack';
import { getStacksAccount } from '../StacksAccount';
import { addressToString } from '@blockstack/stacks-transactions';
import { CreateMonsterButton } from '../CreateMonsterButton';
import { MyMonsters } from '../MyMonsters';
import { BuyMonsters } from '../BuyMonsters';

export default function Monsters(props) {
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
          <h1 className="card-title">Monster Land</h1>
          Feed, buy, sell monsters
          <br />
          Monsters as seen on <a href="https://planet.friedger.de">Monster Planet</a>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <CreateMonsterButton ownerStxAddress={ownerStxAddress} />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <MyMonsters ownerStxAddress={ownerStxAddress} />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <BuyMonsters ownerStxAddress={ownerStxAddress} />
        </div>
        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
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
            <li className="list-group-item">Collect some monsters</li>
          </ul>
        </div>
      </div>
    </main>
  );
}