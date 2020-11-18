import React from 'react';
import { Stacking } from '../components/Stacking';

import { useBlockstack } from 'react-blockstack';

export default function StackingActivies(props) {
  const { userData } = useBlockstack();
  const ownerStxAddress = userData.profile.stxAddress;

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
