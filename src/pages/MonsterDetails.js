import React from 'react';

import { Monster } from '../components/Monster';
import { useStxAddresses } from '../lib/hooks';

export default function MonsterDetails({ monsterId }) {
  const { ownerStxAddress } = useStxAddresses();
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
          <Monster ownerStxAddress={ownerStxAddress} monsterId={monsterId} />
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
              Bid for the monster for 1000 uSTX. Only if the owner selects you, you have to pay for
              it.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
