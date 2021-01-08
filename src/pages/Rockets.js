import React from 'react';

import { BuyRocket } from '../components/BuyRocket';
import { MyRockets } from '../components/MyRockets';
import { useStxAddresses } from '../lib/hooks';

export default function Rockets() {
  const { ownerStxAddress } = useStxAddresses();
  console.log({ ownerStxAddress });
  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Rockets</h1>
          Fly to the moon
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <BuyRocket ownerStxAddress={ownerStxAddress} />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <MyRockets ownerStxAddress={ownerStxAddress} />
        </div>

        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Order a rocket</li>
            <li className="list-group-item">Wait for delivery</li>
            <li className="list-group-item">Fly the rocket</li>
            <li className="list-group-item">Let others fly your rocket</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
