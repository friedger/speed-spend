import React from 'react';
import { Stacking } from '../components/Stacking';

import { useStxAddresses } from '../lib/hooks';

export default function StackingActivies(props) {
  const { ownerStxAddress } = useStxAddresses();

  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Stacking Activities</h1>
        </div>

        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <Stacking ownerStxAddress={ownerStxAddress} />
        </div>
      </div>
    </main>
  );
}
