import React from 'react';

import { CreateMonsterButton } from '../components/CreateMonsterButton';
import { MyMonsters } from '../components/MyMonsters';
import { BuyMonsters } from '../components/BuyMonsters';
import { useStxAddresses } from '../lib/hooks';

export default function Monsters(props) {
  const { ownerStxAddress } = useStxAddresses();
  console.log({ ownerStxAddress });
  return (
    <main className="panel-welcome mt-5 container">
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
